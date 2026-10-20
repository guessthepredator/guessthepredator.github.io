import {COMMUNITY_INTEL} from './community_intel265.mjs';
import {MODES,hash,streak,gameScore,puzzleAnswers} from './engine.mjs';
/** Two deterministic UTC challenges: first FULL SCAN, then ONE SIGNAL.
 * Each day rotates which of the five existing game modes the track uses.
 * Older V2.17 day data is retained without modifying it.
 */
export const DAILY_TRACKS=Object.freeze(['full','signal']);
export function dailySchedule(day){
 const pivot=hash('gtp:v218:daily:'+day)%MODES.length;
 return {full:MODES[pivot],signal:MODES[(pivot+2)%MODES.length]};
}
export function dailyAnswers(day,roster){
 const schedule=dailySchedule(day),answers=puzzleAnswers(day,roster);
 return Object.fromEntries(DAILY_TRACKS.map(track=>[track,answers[schedule[track]]]));
}
export const currentDailyRounds=(days,day)=>{const chosen=days?.[day]?.daily265;return chosen?{single:true,choice:chosen.track,[chosen.track]:chosen.round}:days?.[day]?.daily218||{};};
export const checkpointCount=(days,day)=>days?.[day]?.daily265?Number(Boolean(days[day].daily265.round?.finished)):DAILY_TRACKS.reduce((n,track)=>n+Number(Boolean(currentDailyRounds(days,day)[track]?.finished)),0);
export function dailyStats(days,day){
 const flat=Object.fromEntries(Object.entries(days||{}).map(([key,entry])=>{
  if(entry?.daily265){const r=entry.daily265.round;return [key,{full:r,signal:r}];}
  const two=entry?.daily218||{};
  if(DAILY_TRACKS.every(track=>two[track]?.finished))return [key,two];
  // A legacy five-round clear is still a completed day for local streak display.
  if(MODES.every(mode=>entry?.[mode]?.finished))return [key,{full:{won:MODES.every(m=>entry[m]?.won)},signal:{won:MODES.every(m=>entry[m]?.won)}}];
  return [key,two];
 }));
 // streak() counts days only if both tracks were won.
 const fullyWon=Object.fromEntries(Object.entries(flat).map(([key,entry])=>[key,Object.fromEntries(DAILY_TRACKS.map(track=>[track,{won:!!entry[track]?.won,finished:!!entry[track]?.finished}]))]));
 // Convert incomplete days into empty maps to preserve sequential ordering.
 return streak(fullyWon,day,DAILY_TRACKS);
}
/** Original tactical field notes and practical puzzle tips. No unverifiable EA attribution. */
export const INTEL_POOL=Object.freeze({...COMMUNITY_INTEL,3:COMMUNITY_INTEL[2]});
export function intelFor(day,index){
  const pool=INTEL_POOL[index];
  if(!pool)throw Error('Unknown intel checkpoint');
  return pool[hash('gtp:v223:intel:'+index+':'+day)%pool.length];
}
// Backward compatible API used by earlier release tests.
export function rewardFor(day,index){
  const entry=intelFor(day,index);
  return (index===2?'ADVANCED INTEL · ':'')+entry.title+' · '+entry.tip;
}

/** Ranked progression never routes into practice, including after the second stage. */
export function nextDailyStep(rounds,triviaComplete=false){
 if(rounds.single)return rounds[rounds.choice]?.finished?(triviaComplete?'leaderboard':'trivia'):rounds.choice;
 if(!rounds.full?.finished)return 'full';
 if(!rounds.signal?.finished)return 'signal';
 return triviaComplete?'leaderboard':'trivia';
}
