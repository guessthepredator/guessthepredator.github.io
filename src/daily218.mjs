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
export const currentDailyRounds=(days,day)=>days?.[day]?.daily218||{};
export const checkpointCount=(days,day)=>DAILY_TRACKS.reduce((n,track)=>n+Number(Boolean(currentDailyRounds(days,day)[track]?.finished)),0);
export function dailyStats(days,day){
 const flat=Object.fromEntries(Object.entries(days||{}).map(([key,entry])=>{
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
export function rewardFor(day,index){
 const first=[
  'After spotting an enemy team, communicate the safe route as well as their position; a callout becomes useful when your squad knows where to move.',
  'Before an aggressive push, agree on your fallback cover. A clean reset matters more than chasing one knock.',
  'If the next ring forces a rotation, set a rendezvous point early so mobility abilities do not split the squad.',
  'Treat your first scan as a timing cue for the whole team, not just information for yourself.',
  'When playing support, consider the route teammates will use to reach the ability safely.'
 ];
 const rare=[
  'ADVANCED INTEL · Two-angle bait: after revealing your position, rotate to a different sightline before the next peek. An opponent holding the first angle may have to re-adjust.',
  'ADVANCED INTEL · Create crossfire before you commit: two safe off-angles force an opponent to choose which threat to face, even without a numbers advantage.',
  'ADVANCED INTEL · Space your utility: avoid overlapping all defensive abilities at once. Staggered utility can extend the time a position stays playable.',
  'ADVANCED INTEL · Pre-aim your exit, not only the engagement. Keeping a retreat angle available prevents a small advantage from turning into a trap.',
  'ADVANCED INTEL · Audio discipline: after a loud reposition, briefly settle before re-engaging. Opponents may still be tracking your previous sound direction.'
 ];
 const source=index===1?first:rare;
 return source[hash('gtp:v218:reward:'+index+':'+day)%source.length];
}
