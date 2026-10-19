import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {legends} from '../src/data.mjs';
import {FIELDS,LABELS,MODE_NAMES,newRound,scannerState,scannerDisplayValue,legendByName,maxGuesses,remainingTime} from '../src/engine.mjs';
const app=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const fn=(name,next)=>app.slice(app.indexOf('function '+name+'('),app.indexOf('function '+next+'('));
function homeMarkup({session='daily',full=false,signal=false,trivia=false}={}){
 const rounds={full:{finished:full},signal:{finished:signal}};
 const context={session,legends,MODE_NAMES,esc,store:{days:{},practice:{}},today:()=> '2026-10-19',utcDay:()=> '2026-10-19',
 currentDailyRounds:()=>rounds,checkpointCount:()=>Number(full)+Number(signal),totalIntelCheckpoints:()=>Number(full)+Number(signal)+Number(trivia),
 dailySpotlight:()=>legends[0],dailySchedule:()=>({full:'classic',signal:'quote'}),triviaRewardEarned:()=>trivia,intelState:()=>({unlocked:false,read:false}),
 portrait:()=>'<span class="test-portrait"></span>',playContext:()=>'<section class="only-play-selector"></section>'};
 return vm.runInNewContext(fn('home','homeLegacy')+'home()',context);
}
test('completed Daily cards and Trivia grey out; Free Play remains available',()=>{
 const html=homeMarkup({full:true,signal:true,trivia:true});
 for(const mode of ['CLASSIC MODE','QUOTE MODE','TRIVIA']){
   const tag=[...html.matchAll(/<button[^>]*>/g)].map(m=>m[0]).find(t=>t.includes('aria-label="'+mode+' — DAILY COMPLETED'));
   assert.ok(tag,mode);assert.match(tag,/tac-completed/);assert.match(tag,/ disabled /);
 }
 assert.equal((homeMarkup({session:'unlimited',full:true,signal:true,trivia:true}).match(/tac-completed/g)||[]).length,0);
 assert.ok(!html.includes('gtp222-primary-actions'));
 assert.equal((html.match(/only-play-selector/g)||[]).length,1);
});
test('every guessing mode renders six real scanner traits and one session status',()=>{
 for(const active of ['classic','pixel','quote','ability','emoji']){
  const round=newRound('Mirage','full');const host={slug:'mirage',name:'MIRAGE'};
  const context={active,session:'unlimited',legends,FIELDS,LABELS,esc,scannerState,scannerDisplayValue,legendByName,maxGuesses,remainingTime,
   ensureRound:()=>round,MODE_HOSTS:Object.fromEntries([active].map(m=>[m,host])),TAGLINES:{[active]:'Clue'},classOf:()=>'',portrait:()=>'',
   quickModeLinks:()=>'',cinematicStageAside:()=>'',getVisual:()=>'<div>Clue</div>',cinematicControls:()=>'',triedLegendNote:()=>'',visibleRoundModes:()=>'',
   victoryIntelState:()=>null};
  const html=vm.runInNewContext(fn('cinematicIdentityBoard','cinematicStageAside')+fn('game','howTo')+'game()',context);
  assert.equal((html.match(/class="gtp230-trait gtp230-trait-/g)||[]).length,6,active);
  assert.equal((html.match(/FREE PLAY · UNRANKED/g)||[]).length,1,active);
  assert.ok(!html.includes('tac-play-context'),active);
 }
});
test('Practice starts without nickname; Ranked still requests one',async()=>{
 for(const triviaMode of ['practice','daily']){
  let prompts=0,requests=0;
  const context={triviaMode,triviaBusy:false,triviaMessage:'',screen:'trivia',triviaRun:null,triviaAnswerText:'',savedNickname:()=>'',
   render:()=>{},openIdentityPrompt:()=>prompts++,saveTriviaReward:()=>{},focusTriviaQuestion:()=>{},
   triviaRequest:async p=>{requests++;assert.equal(p.displayName,'Practice');return {finished:false};}};
  await vm.runInNewContext(app.slice(app.indexOf('async function triviaStart('),app.indexOf('async function triviaSubmitAnswer('))+'triviaStart()',context);
  assert.equal(prompts,triviaMode==='daily'?1:0);assert.equal(requests,triviaMode==='daily'?0:1);
 }
});
