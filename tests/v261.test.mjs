import {chooseDaily as chooseDaily265,chosenDaily as chosenDaily265} from '../src/daily265.mjs';import {legends as roster265} from '../src/data.mjs';import {COMMUNITY_INTEL as community265} from '../src/community_intel265.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
const functions=(a,b)=>app.slice(app.indexOf('function '+a+'('),app.indexOf('function '+b+'('));
function triviaHarness(){
 const pending=[];const ctx={checkDailyRollover:()=>false,triviaEpoch:0,triviaMode:'daily',triviaRun:null,triviaBusy:false,triviaSubmitting:false,triviaRetryAt:0,screen:'trivia',utcDay:()=> '2026-10-19',render:()=>{},sound:()=>{},saveTriviaReward:()=>{},loadTriviaBoards:()=>{},focusTriviaQuestion:()=>{},triviaRequest:()=>new Promise((resolve,reject)=>pending.push({resolve,reject}))};
 vm.createContext(ctx);vm.runInContext(functions('resetTriviaView','focusTriviaQuestion'),ctx);return {ctx,pending,run:code=>vm.runInContext(code,ctx)};
}
test('stale Daily response cannot overwrite Practice or unlock its pending controls',async()=>{
 const {ctx,pending,run}=triviaHarness();const daily=run("triviaAction('start',{mode:'daily'})");
 run("resetTriviaView();triviaMode='practice'");const practice=run("triviaAction('start',{mode:'practice'})");
 pending[0].resolve({mode:'daily',runId:'old'});await daily;
 assert.equal(ctx.triviaRun,null);assert.equal(ctx.triviaBusy,true);
 pending[1].resolve({mode:'practice',runId:'current'});await practice;
 assert.equal(ctx.triviaRun.mode,'practice');assert.equal(ctx.triviaRun.day,'2026-10-19');assert.equal(ctx.triviaBusy,false);
});
test('expired answer failure clears the attempt key and schedules a bounded retry',async()=>{
 const {ctx,pending,run}=triviaHarness();ctx.triviaExpiredKey='expired';
 const request=run("triviaAction('answer',{runId:'a',answer:''},true)");pending[0].reject(Error('offline'));await request;
 assert.equal(ctx.triviaExpiredKey,'');assert.ok(ctx.triviaRetryAt>Date.now());assert.ok(ctx.triviaRetryAt<=Date.now()+3100);assert.equal(ctx.triviaBusy,false);
});
test('stale request errors cannot replace the current Trivia error state',async()=>{
 const {ctx,pending,run}=triviaHarness();const request=run("triviaAction('start',{mode:'daily'})");run("resetTriviaView();triviaMode='practice';triviaMessage='current'");pending[0].reject(Error('stale'));await request;assert.equal(ctx.triviaMessage,'current');
});
test('a cross-midnight Trivia completion rewards the run day and stores its actual receipt',()=>{
 const writes=new Map();vm.runInNewContext(functions('saveTriviaReward','totalIntelCheckpoints')+"saveTriviaReward({finished:true,mode:'daily',day:'2026-10-19',score:70,correctAnswers:4})",{utcDay:()=> '2026-10-20',triviaDailyRewardKey:d=>'reward:'+d,localStorage:{setItem:(k,v)=>writes.set(k,v)}});
 assert.equal(writes.get('reward:2026-10-19'),'yes');assert.equal(writes.has('reward:2026-10-20'),false);assert.deepEqual(JSON.parse(writes.get('tac:trivia-receipt:2026-10-19')),{score:70,correctAnswers:4});
});
const backend=readFileSync(new URL('../supabase/functions/submit-score/index.ts',import.meta.url),'utf8');const valid=vm.runInNewContext(backend.slice(backend.indexOf('function validRankedTimer('),backend.indexOf('Deno.serve('))+'validRankedTimer');
test('ranked timing rejects future, previous-day and missing timestamps including legacy rounds',()=>{
 const now=Date.parse('2026-10-19T12:00:00Z');const r={timeLimit:120,startedAt:now-60000,finishedAt:now-1000,won:true};assert.equal(valid(r,now),true);
 for(const changed of [{startedAt:now+86400000,finishedAt:now+86400000},{startedAt:now-86400000},{finishedAt:now+3000},{timeLimit:0,startedAt:null},{finishedAt:now-60001}])assert.equal(valid({...r,...changed},now),false);
 assert.equal(valid({...r,timeLimit:0},now),true);
});
test('UTC rollover initializes the visible Daily round instead of leaving a stale game',()=>{assert.ok(app.includes("beginDaily();showToast('A new UTC day has started. Choose your Daily difficulty.')"));const days={};chooseDaily265(days,'2026-10-20','full',roster265);assert.equal(chosenDaily265(days,'2026-10-21'),null);});
test('Daily summary uses real receipts and exposes a ranked submit form before Trivia',()=>{assert.ok(app.includes('receipt?.totalScore??summary.score'));assert.ok(app.includes('SUBMIT DAILY SCORE'));assert.ok(app.includes('One puzzle. One mystery Legend.'));assert.ok(app.includes('Daily Trivia score'));});
