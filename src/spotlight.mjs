/** Daily spotlight and wheel helpers — kept separate from secret puzzle answers. */
import {hash,shuffle,puzzleAnswers} from './engine.mjs?v=2.6.0';

const EPOCH_DAY=Date.UTC(2026,0,1)/86400000;
const isoDayNumber=day=>Math.floor(Date.parse(day+'T00:00:00Z')/86400000);
const toDay=number=>new Date(number*86400000).toISOString().slice(0,10);

/** Return a stable, playable daily Legend that is never one of today's puzzle answers.
 * For each new UTC day after 2026-01-01, exclude the previous day's public spotlight
 * as well, so the recommendation cannot repeat on adjacent dates. No secret guesses leak.
 */
export function dailySpotlight(day,roster){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Number.isFinite(Date.parse(day+'T00:00:00Z')))throw Error('Invalid spotlight day');
  if(roster.length<8)throw Error('Spotlight requires at least eight Legends');
  const end=isoDayNumber(day);
  // Iterate from a fixed anchor. The result does not depend on visit history,
  // timezone offset, localStorage, app session, or the order users open different days.
  const start=Math.min(EPOCH_DAY,end);
  let previous=null;
  const uniqueNames=new Set(roster.map(l=>l.name));
  if(uniqueNames.size!==roster.length)throw Error('Duplicate Legends');
  let winner=null;
  for(let number=start;number<=end;number++){
    const date=toDay(number);
    const secret=new Set(Object.values(puzzleAnswers(date,roster)));
    const pool=shuffle(roster,hash('gtp:v15:spotlight:'+date));
    winner=pool.find(l=>!secret.has(l.name)&&l.name!==previous);
    if(!winner)throw Error('No available daily spotlight');
    previous=winner.name;
  }
  return winner;
}

export function wheelChoices(roster){
  if(!Array.isArray(roster)||roster.length<1)throw Error('Wheel requires Legends');
  return roster.slice().sort((a,b)=>a.name.localeCompare(b.name));
}
export function wheelPick(roster,random=Math.random){
  const list=wheelChoices(roster);
  const n=random();
  if(!Number.isFinite(n)||n<0||n>=1)throw Error('Random source must return [0,1)');
  return list[Math.floor(n*list.length)];
}
/** Top-pointer wheel: segment zero is centered at twelve o'clock. */
export function destinationRotation(currentAngle,selectedIndex,total){
  const slice=Math.PI*2/total;
  const revolutions=Math.ceil(currentAngle/(2*Math.PI))+5;
  const angle=revolutions*(Math.PI*2)-selectedIndex*slice;
  return angle<=currentAngle?angle+Math.PI*2:angle;
}
