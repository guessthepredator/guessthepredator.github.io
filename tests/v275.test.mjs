import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {nextFreeMode,writtenAnswerPlaceholder} from '../src/flow275.mjs';
const app=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
test('Next Free Play cycles all six modes and wraps Trivia to Classic',()=>{
 const visited=[];let mode='classic';for(let i=0;i<6;i++){visited.push(mode);mode=nextFreeMode(mode);}
 assert.deepEqual(visited,['classic','pixel','quote','ability','emoji','trivia']);assert.equal(mode,'classic');
});
test('Written question instructions match number and ability questions',()=>{
 assert.match(writtenAnswerPlaceholder({category:'release'}),/number/);
 assert.match(writtenAnswerPlaceholder({category:'ultimates'}),/ability name/);
 assert.match(writtenAnswerPlaceholder({category:'systems',prompt:'How many Apex Coins?'}),/number/);
 assert.equal(writtenAnswerPlaceholder({category:'systems',prompt:'Name an original Legend'}),'Type your answer…');
});
function rolloverContext(overrides={}){
 const calls=[];const c={utcDay:()=> '2026-10-21',lastSpotlightUTC:'2026-10-20',triviaMode:'daily',triviaBoard:{daily:[1],overall:[2]},sharedDay:null,screen:'trivia',session:'daily',wheelOpen:false,
 loadStore:()=>({days:{}}),boardData:{daily:[1],overall:[2]},useCurrentDay:()=>{},intelModalOpen:false,resetTriviaView:()=>calls.push('resetTrivia'),beginDaily:()=>calls.push('beginDaily'),showToast:()=>{},render:()=>calls.push('render'),refreshBoards:()=>{},loadTriviaBoards:()=>{},...overrides};
 vm.createContext(c);vm.runInContext(app.slice(app.indexOf('function checkDailyRollover(){'),app.indexOf("window.addEventListener('focus',checkDailyRollover)")),c);c.calls=calls;return c;
}
test('UTC rollover clears a completed or active Daily Trivia view once and preserves overall scores',()=>{
 const c=rolloverContext();vm.runInContext('checkDailyRollover();checkDailyRollover()',c);assert.deepEqual(c.calls,['resetTrivia','render']);assert.equal(c.triviaBoard.daily.length,0);assert.deepEqual(c.triviaBoard.overall,[2]);
});
test('UTC rollover opens a fresh Daily puzzle selection without resetting Free Play',()=>{
 const daily=rolloverContext({screen:'game'});vm.runInContext('checkDailyRollover()',daily);assert.deepEqual(daily.calls,['resetTrivia','beginDaily']);
 const free=rolloverContext({screen:'game',session:'unlimited',triviaMode:'practice'});vm.runInContext('checkDailyRollover()',free);assert.deepEqual(free.calls,[]);
});
test('Yesterday’s Daily Trivia response cannot replace today’s view',()=>{
 const c={triviaEpoch:5,triviaMode:'daily',utcDay:()=> '2026-10-21'};vm.createContext(c);vm.runInContext(app.match(/function currentTriviaContext\(context\)\{[^\n]+/)[0],c);
 assert.equal(vm.runInContext("currentTriviaContext({epoch:5,mode:'daily',day:'2026-10-20'})",c),false);assert.equal(vm.runInContext("currentTriviaContext({epoch:5,mode:'daily',day:'2026-10-21'})",c),true);
});
test('Starting today’s Daily removes only the archived date from a shared URL',()=>{
 let replaced='';const c={sharedDay:'2026-10-19',URL,location:{href:'https://example.com/?day=2026-10-19&theme=dark#play'},history:{replaceState:(_state,_title,url)=>{replaced=String(url)}}};vm.createContext(c);vm.runInContext(app.slice(app.indexOf('function useCurrentDay(){'),app.indexOf('function beginDaily(){')),c);vm.runInContext('useCurrentDay()',c);assert.equal(c.sharedDay,null);assert.equal(replaced,'https://example.com/?theme=dark#play');
});
