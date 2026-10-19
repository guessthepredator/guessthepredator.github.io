import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {INTEL_POOL} from '../src/daily218.mjs';
import {newRound} from '../src/engine.mjs';
const app=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
const backend=readFileSync(new URL('../supabase/functions/submit-score/index.ts',import.meta.url),'utf8');
const timer=backend.slice(backend.indexOf('function validRankedTimer('),backend.indexOf('Deno.serve('));
const validate=vm.runInNewContext(timer+'validRankedTimer');
const valid=r=>validate(r,200000);
test('ranked timer accepts a timely win and preserves legacy rounds',()=>{
 assert.equal(valid({timeLimit:0,startedAt:1000,finishedAt:2000}),true);
 assert.equal(valid({timeLimit:120,startedAt:1000,finishedAt:120999,won:true}),true);
 assert.equal(valid({timeLimit:120,startedAt:1000,finishedAt:121000,won:false,loss:'time'}),true);
});
test('ranked timer rejects missing timestamps, late wins and premature timeouts',()=>{
 for(const r of [
 {timeLimit:120,won:true},
 {timeLimit:120,startedAt:1000,finishedAt:999,won:true},
 {timeLimit:120,startedAt:1000,finishedAt:121000,won:true},
 {timeLimit:120,startedAt:1000,finishedAt:2000,won:false,loss:'time'},
 {timeLimit:180,startedAt:1000,finishedAt:2000,won:true}
 ])assert.equal(valid(r),false);
});
function daily(saved){
 const store={days:{day:{daily218:saved?{full:saved}:{}}}};
 const body=app.slice(app.indexOf('function ensureRound('),app.indexOf('function ensurePracticeRound('));
 // Only execute the daily branch; later declarations are irrelevant to this test.
 const dailyBody=body.slice(0,body.indexOf(' let round=store.practice[mode];'))+'}';
 const context={store,active:'classic',session:'daily',dailyTrack:'full',today:()=> 'day',dailySchedule:()=>({full:'classic'}),dailyAnswers:()=>({full:'Loba'}),legends:[],newRound,sync:()=>{}};
 return vm.runInNewContext(dailyBody+'ensureRound()',context);
}
test('new and untouched ranked rounds enable Rush; started and finished rounds retain rules',()=>{
 assert.equal(daily().timeLimit,120);
 assert.equal(daily(newRound('Loba','full',0)).timeLimit,120);
 const started={...newRound('Loba','full',0),startedAt:1000,guesses:['Wraith']};
 assert.equal(daily(started).timeLimit,0);
 assert.equal(daily({...started,finished:true}).timeLimit,0);
});
test('all Forbidden Intel cards offer gameplay advice and a practical drill',()=>{
 const tips=Object.values(INTEL_POOL).flat();
 assert.equal(tips.length,24);
 assert.equal(new Set(tips.map(t=>t.title)).size,24);
 for(const tip of tips){
  assert.ok(tip.tip.length>90);
  assert.ok(tip.drill.length>40);
  assert.match(tip.source,/^https:\/\/(help\.ea\.com|www\.ea\.com)\//);
  assert.doesNotMatch(tip.tip,/puzzle|trait comparison|daily checkpoint|guess the legend/i);
 }
});
