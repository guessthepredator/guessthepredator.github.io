import {MODES,gameScore,streak} from './engine.mjs';
/** Score is calculated locally for preview and recalculated on the server for public rankings. */
export function dailySummary(days,day){
 const rounds=days[day]||{};
 const completed=MODES.every(mode=>rounds[mode]?.finished);
 const allWon=MODES.every(mode=>rounds[mode]?.won);
 const baseScore=MODES.reduce((total,mode)=>total+gameScore(rounds[mode]||{}),0);
 const stats=streak(days,day,MODES);
 const run=allWon?Math.max(1,stats.current):0;
 const bonus=Math.round(baseScore*Math.min(run,10)*.05);
 return {completed,allWon,baseScore,bonus,score:baseScore+bonus,streak:run};
}
export function buildSubmission(days,day,displayName){
 const rounds=days[day]||{};
 return {day,displayName,rounds:Object.fromEntries(MODES.map(mode=>{
  const r=rounds[mode];return [mode,{guesses:r?.guesses||[],hints:r?.hints||[],mode:r?.mode||'signal',timeLimit:r?.timeLimit||0,finished:r?.finished||false,won:r?.won||false,loss:r?.loss||null,startedAt:r?.startedAt||null,finishedAt:r?.finishedAt||null}];
 }))};
}
