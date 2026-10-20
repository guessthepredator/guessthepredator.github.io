import {dailySchedule} from './daily218.mjs?ui=2.65.0';
import {newRound,puzzleAnswers} from './engine.mjs';
export const DAILY_RULES=Object.freeze({full:{label:'FULL SCAN',difficulty:'EASY',guesses:5},signal:{label:'ONE SIGNAL',difficulty:'HARD',guesses:6}});
export function chosenDaily(days,day){return days?.[day]?.daily265||null;}
export function migrateSingleDaily(days,day){
 if(chosenDaily(days,day))return false;
 const legacy=days?.[day]?.daily218;if(!legacy)return false;
 const track=['full','signal'].find(t=>legacy[t]?.startedAt||legacy[t]?.finished||legacy[t]?.guesses?.length);
 if(!track)return false;
 days[day]={...days[day],daily265:{track,gameMode:dailySchedule(day)[track],round:legacy[track],migrated:true}};return true;
}
export function chooseDaily(days,day,track,roster){
 if(!DAILY_RULES[track])throw Error('Invalid Daily difficulty');
 migrateSingleDaily(days,day);const existing=chosenDaily(days,day);if(existing)return existing;
 const gameMode=dailySchedule(day).full;
 const chosen={track,gameMode,round:newRound(puzzleAnswers(day,roster)[gameMode],track,120)};
 days[day]={...(days[day]||{}),daily265:chosen};return chosen;
}
