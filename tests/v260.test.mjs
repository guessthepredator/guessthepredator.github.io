import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {nextDailyStep} from '../src/daily218.mjs';
import {visibleEmojiCount,newRound,tryGuess,maxGuesses} from '../src/engine.mjs';
import {legends} from '../src/data.mjs';
const app=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
test('Emoji reveals 2, 3, 3, 4, 4, 5 clues across guesses 0 through 5',()=>{
 assert.deepEqual(Array.from({length:6},(_,n)=>visibleEmojiCount({guesses:Array(n)})),[2,3,3,4,4,5]);
 assert.equal(visibleEmojiCount({guesses:Array(12)}),5);
});
test('Full Scan ends after exactly 5 wrong guesses; One Signal after 6',()=>{
 for(const [mode,limit] of [['full',5],['signal',6]]){
  let r=newRound('Loba',mode);
  const wrong=legends.filter(l=>l.name!=='Loba').slice(0,limit);
  assert.equal(maxGuesses(r),limit);
  wrong.forEach((l,i)=>{r=tryGuess(r,l.name,legends,1000+i);assert.equal(r.finished,i===limit-1);});
  assert.equal(r.won,false);
  assert.equal(tryGuess(r,'Loba',legends,2000),r);
 }
});
test('Daily progression includes Trivia and never emits a Free Play destination',()=>{
 assert.equal(nextDailyStep({}), 'full');
 assert.equal(nextDailyStep({full:{finished:true}}),'signal');
 const rounds={full:{finished:true},signal:{finished:true}};
 assert.equal(nextDailyStep(rounds,false),'trivia');
 assert.equal(nextDailyStep(rounds,true),'leaderboard');
});
function nextContext(rounds,triviaComplete=false,session='daily'){
 const calls=[];
 const context={session,active:'classic',store:{days:{},settings:{}},today:()=> 'day',currentDailyRounds:()=>rounds,
  nextDailyStep,triviaRewardEarned:()=>triviaComplete,dailySchedule:()=>({full:'classic',signal:'quote'}),
  openMode:(...args)=>calls.push(['open',...args]),randomPractice:()=>calls.push(['practice']),sync:()=>{},render:()=>{},
  refreshBoards:()=>{},loadTriviaBoards:()=>{},sound:()=>{},calls};
 vm.createContext(context);
 vm.runInContext(app.slice(app.indexOf('function nextMode('),app.indexOf('function showToast(')),context);
 return context;
}
test('Next Daily keeps One Signal ranked even if a global session flag is stale',()=>{
 const ctx=nextContext({full:{finished:true}},false,'unlimited');
 vm.runInContext("nextMode('daily')",ctx);
 assert.deepEqual(ctx.calls,[['open','quote','daily']]);
});
test('Next after both stages opens Daily Trivia; completed Trivia opens rankings',()=>{
 const rounds={full:{finished:true},signal:{finished:true}};
 for(const completed of [false,true]){
  const ctx=nextContext(rounds,completed);
  vm.runInContext("nextMode('daily')",ctx);
  assert.equal(ctx.session,'daily');
  assert.equal(ctx.store.settings.session,'daily');
  assert.equal(ctx.screen,completed?'leaderboard':'trivia');
  if(!completed)assert.equal(ctx.triviaMode,'daily');
  assert.deepEqual(ctx.calls,[]);
 }
});
test('Play Again explicitly retains Free Play',()=>{
 const ctx=nextContext({},false,'unlimited');vm.runInContext("nextMode('unlimited')",ctx);
 assert.deepEqual(ctx.calls,[['practice']]);
 assert.doesNotMatch(app,/data-action="next" data-session="\$\{session\}"[^>]*>[^<]*PLAY AGAIN/);
});
test('unsupported Daily mode cannot silently change session or start a practice round',()=>{
 const ctx={MODES:['classic','quote','emoji'],session:'daily',dailySchedule:()=>({full:'classic',signal:'quote'}),today:()=> 'day',showToast:()=>{},currentDailyRounds:()=>({}),store:{settings:{}}};
 vm.createContext(ctx);vm.runInContext(app.slice(app.indexOf('function openMode('),app.indexOf('function submitGuess('))+"openMode('emoji','daily')",ctx);
 assert.equal(ctx.session,'daily');
 assert.equal(ctx.store.settings.session,undefined);
});
