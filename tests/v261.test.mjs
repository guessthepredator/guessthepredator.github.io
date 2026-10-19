import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
const functions=(a,b)=>app.slice(app.indexOf('function '+a+'('),app.indexOf('function '+b+'('));
function triviaHarness(){
 const pending=[];const ctx={triviaEpoch:0,triviaMode:'daily',triviaRun:null,triviaBusy:false,triviaSubmitting:false,triviaRetryAt:0,screen:'trivia',utcDay:()=> '2026-10-19',render:()=>{},sound:()=>{},saveTriviaReward:()=>{},loadTriviaBoards:()=>{},focusTriviaQuestion:()=>{},triviaRequest:()=>new Promise((resolve,reject)=>pending.push({resolve,reject}))};
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
test('UTC rollover initializes the visible Daily round instead of leaving a stale game',()=>{
 let day='2026-10-19',tick,initialized=0,rendered=0;
 const ctx={utcDay:()=>day,setInterval:fn=>{tick=fn},screen:'game',session:'daily',sharedDay:null,wheelOpen:false,ensureRound:()=>initialized++,render:()=>rendered++,showToast:()=>{},getRound:()=>({}),expireRound:r=>r,document:{getElementById:()=>null}};
 const start=app.indexOf('let lastSpotlightUTC=');const end=app.indexOf('},500);',start)+7;vm.runInNewContext(app.slice(start,end),ctx);day='2026-10-20';tick();assert.equal(initialized,1);assert.equal(rendered,1);
});
test('Daily summary uses real receipts and exposes a ranked submit form before Trivia',()=>{
 const ctx={store:{days:{},submittedDays:{day:{totalScore:4321}}},today:()=> 'day',currentDailyRounds:()=>({full:{finished:true},signal:{finished:true}}),dailySummary:()=>({completed:true,score:9999}),triviaRewardEarned:()=>true,localStorage:{getItem:()=>JSON.stringify({score:70,correctAnswers:4})},checkpointCount:()=>2,sharedDay:null,utcDay:()=> 'day',leaderboardConfigured:()=>true,esc:s=>s,savedNickname:()=> 'Player',scoreSubmitting:false};
 let html=vm.runInNewContext(functions('dailyDebrief','records')+'dailyDebrief()',ctx);assert.match(html,/4,321/);assert.match(html,/70/);assert.match(html,/VIEW BOTH RANKINGS/);assert.doesNotMatch(html,/LOCAL PREVIEW/);
 ctx.store.submittedDays={};ctx.triviaRewardEarned=()=>false;html=vm.runInNewContext(functions('dailyDebrief','records')+'dailyDebrief()',ctx);assert.match(html,/SUBMIT DAILY SCORE/);assert.match(html,/name="nickname" required/);assert.match(html,/CONTINUE TO DAILY TRIVIA/);
});
