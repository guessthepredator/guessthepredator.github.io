import {localAbilitySlugs} from './abilities.mjs?v=2.8.0';
/** Guess the Predator 2 · Deduction engine. No DOM, timers or network in this module. */
export const FIELDS = Object.freeze(['role', 'gender', 'form', 'age', 'debut']);
export const LABELS = Object.freeze({role: 'CLASS', gender: 'GENDER', form: 'FORM', age: 'AGE', debut: 'LAUNCH'});
export const MODES = Object.freeze(['classic', 'pixel', 'quote', 'ability', 'emoji']);
export const MODE_NAMES = Object.freeze({classic:'CLASSIC',pixel:'PIXEL',quote:'QUOTE',ability:'ABILITY',emoji:'EMOJI'});
export const MAX_GUESSES = 6;
export const FULL_SCAN_GUESSES = 5;
export const maxGuesses = round => round?.mode === 'full' ? FULL_SCAN_GUESSES : MAX_GUESSES;
export const MAX_HINTS = 2;
export const CLASS_NAMES = Object.freeze(['All','Assault','Skirmisher','Recon','Controller','Support']);
export const FORMAT_VERSION = 16;

export function hash(value) {
  let n = 2166136261;
  for (const char of String(value)) { n ^= char.charCodeAt(0); n = Math.imul(n,16777619); }
  return n >>> 0;
}
export function shuffle(source, seed) {
  const result = [...source]; let n=seed>>>0;
  const next=()=>{n^=n<<13;n^=n>>>17;n^=n<<5;return (n>>>0)/4294967296};
  for (let i=result.length-1;i>0;i--){const j=Math.floor(next()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
export function utcDay(now=new Date()) { return new Date(now).toISOString().slice(0,10); }
export function puzzleAnswers(day, roster) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(Date.parse(day+'T00:00:00Z'))) throw Error('Invalid date');
  if (roster.length < MODES.length) throw Error('Missing Legends');
  const shuffled=shuffle(roster,hash('gtp:v15:'+day));
  const answers=Object.fromEntries(MODES.map((mode,i)=>[mode,shuffled[i].name]));
  // Gameplay stays reliable: Daily Ability uses only the 8 real, locally
  // bundled icons from the user's screenshot until the rest are verified.
  const used=new Set(['classic','pixel','quote','emoji'].map(mode=>answers[mode]));
  const allowed=new Set(localAbilitySlugs);
  const pool=shuffle(roster.filter(l=>allowed.has(l.slug)&&!used.has(l.name)),hash('gtp:v15.2:ability:'+day));
  if(!pool.length)throw Error('Missing local Ability icon pool');
  answers.ability=pool[0].name;
  return answers;
}
export function newRound(answer, mode='signal', timeLimit=0) {
  return {answer,mode:mode==='full'?'full':'signal',timeLimit:timeLimit===180?180:0,
    guesses:[],signals:[],hints:[],won:false,finished:false,startedAt:null,deadline:null,finishedAt:null,loss:null};
}
export function legendByName(roster,name){return roster.find(x=>x.name===name);}
export function compare(candidate, target, field){
  const a=candidate[field],b=target[field];
  if(a==null||b==null) return {field,kind:'unknown',value:'UNKNOWN',direction:0};
  if(a===b) return {field,kind:'correct',value:formatValue(a,field),direction:0};
  const numeric=field==='age'||field==='debut';
  return {field,kind:'wrong',value:formatValue(a,field),direction:numeric?(b>a?1:-1):0};
}
export function formatValue(value,field){if(value==null)return 'UNDISCLOSED';if(field==='debut')return value===0?'LAUNCH':`S${value}`;return String(value);}
export function signalForGuess(round,candidate,target,roster){
  const locked=new Set(confirmedFields(round,target,roster));
  const seen=new Set(round.signals.map(s=>s.field));
  const possible=FIELDS.filter(f=>target[f]!=null&&candidate[f]!=null&&!locked.has(f)&&!round.hints.includes(f));
  if(!possible.length)return null;
  const fresh=possible.filter(f=>!seen.has(f));
  const pool=fresh.length?fresh:possible;
  const match=pool.filter(f=>compare(candidate,target,f).kind==='correct');
  const miss=pool.filter(f=>compare(candidate,target,f).kind==='wrong');
  // Random-looking but deterministic, fairly alternating green/red opportunities.
  const roll=hash([target.name,candidate.name,round.guesses.length,round.signals.length].join(':'));
  const colorPool=match.length&&miss.length?(roll%2===0?match:miss):pool;
  const field=colorPool[hash(String(roll)+':field')%colorPool.length];
  return {guess:candidate.name,...compare(candidate,target,field)};
}
export function revealedSignals(round,target,roster){
  if(round.mode==='full')return round.guesses.flatMap(name=>{
    const candidate=legendByName(roster,name);
    return candidate?FIELDS.map(field=>({guess:name,...compare(candidate,target,field)})):[];
  });
  return round.signals;
}
export function confirmedFields(round,target,roster){
  return FIELDS.filter(field=>revealedSignals(round,target,roster).some(s=>s.field===field&&s.kind==='correct'));
}
export function availableHintFields(round,target,roster){
  const known=new Set([...confirmedFields(round,target,roster),...round.hints]);
  return FIELDS.filter(field=>target[field]!=null&&!known.has(field));
}
export function getHint(round,target,roster){
  if(round.finished||!round.guesses.length||round.hints.length>=MAX_HINTS)return round;
  const pool=availableHintFields(round,target,roster);if(!pool.length)return round;
  const field=pool[hash([target.name,round.guesses.join(':'),round.hints.join(':')].join(':'))%pool.length];
  return {...round,hints:[...round.hints,field]};
}
export function expireRound(round,now){
  if(round.finished||!round.deadline||now<round.deadline)return round;
  return {...round,finished:true,finishedAt:round.deadline,loss:'time'};
}
export function tryGuess(round,name,roster,now=Date.now()){
  const live=expireRound(round,now);
  if(live.finished||live.guesses.includes(name))return live;
  const guess=legendByName(roster,name),target=legendByName(roster,live.answer);
  if(!guess||!target)return live;
  const won=name===target.name;
  const signal=won?null:signalForGuess(live,guess,target,roster);
  const guesses=[...live.guesses,name];
  const startedAt=live.startedAt??now;
  const deadline=live.deadline??(live.timeLimit?startedAt+live.timeLimit*1000:null);
  const finished=won||guesses.length>=maxGuesses(live);
  return {...live,guesses,signals:signal?[...live.signals,signal]:live.signals,
    startedAt,deadline,won,finished,finishedAt:finished?now:null,loss:finished&&!won?'attempts':null};
}
export function remainingTime(round,now=Date.now()){
  if(!round.timeLimit)return null;
  if(!round.deadline)return round.timeLimit;
  const moment=round.finished?(round.finishedAt??now):now;
  return Math.max(0,Math.ceil((round.deadline-moment)/1000));
}
export function gameScore(round){
  if(!round.finished||!round.won)return 0;
  const time=remainingTime(round,round.finishedAt)||0;
  return Math.max(100,Math.round(1460-(round.guesses.length-1)*180-round.hints.length*145+(round.timeLimit?time*4:0)));
}
export function gameRank(score){return score>=1700?'S':score>=1200?'A':score>=850?'B':'C';}
export function scannerState(round,target,roster){
  const output={};
  const signals=revealedSignals(round,target,roster);
  for(const field of FIELDS){
    const last=signals.filter(s=>s.field===field).at(-1);
    const green=signals.find(s=>s.field===field&&s.kind==='correct');
    if(target[field]==null){output[field]={field,kind:'unknown',value:'UNDISCLOSED',direction:0};continue;}
    if(green){output[field]={...green,kind:'correct',value:formatValue(target[field],field)};continue;}
    if(round.hints.includes(field)){output[field]={field,kind:'hint',value:formatValue(target[field],field),direction:0};continue;}
    output[field]=last||{field,kind:'hidden',value:'—',direction:0};
  }
  return output;
}
export function filteredRoster(roster,{search='',role='All',sort='az',excluded=[]}={}){
  const term=search.trim().toLocaleLowerCase();const excludedSet=new Set(excluded);
  const result=roster.filter(legend=>(role==='All'||legend.role===role)&&!excludedSet.has(legend.name)&&
    (!term||legend.name.toLocaleLowerCase().includes(term)||legend.role.toLocaleLowerCase().includes(term)));
  return result.sort((a,b)=>sort==='za'?b.name.localeCompare(a.name):a.name.localeCompare(b.name));
}
export function dayCount(dayRounds={},modes=MODES){return modes.filter(mode=>dayRounds[mode]?.won).length;}
export function streak(days,today,modes=MODES){
  const cleared=Object.keys(days).filter(day=>dayCount(days[day],modes)===modes.length).sort();
  let best=0,run=0,prev=-2;for(const day of cleared){const n=Math.floor(Date.parse(day+'T00:00:00Z')/86400000);run=n===prev+1?run+1:1;best=Math.max(best,run);prev=n;}
  const toDay=n=>new Date(n*86400000).toISOString().slice(0,10);
  const n=Math.floor(Date.parse(today+'T00:00:00Z')/86400000);const set=new Set(cleared);
  let current=0,pointer=set.has(today)?n:n-1;
  while(set.has(toDay(pointer))){current++;pointer--;}
  return {current,best,days:cleared.length};
}
