/** Original, non-verbal UI cues only. There is no TTS/announcer or extracted game audio. */
const events=new Set(['nav','pick','clue','wrong','correct','win','lose','reveal',...['classic','pixel','quote','ability','emoji'].map(mode=>'hover-'+mode)]);
const buffers=new Map();const last=new Map();
function getSample(name){
 const key=events.has(name)?name:'nav';
 if(!buffers.has(key)){const file=new Audio(`./assets/sfx/${key}.wav`);file.preload='auto';buffers.set(key,file)}
 return buffers.get(key);
}
export function preloadSoundDeck(){['nav','pick','reveal'].forEach(getSample)}
export function playSound(name,enabled=true){
 if(!enabled)return false;
 const now=performance.now();const minGap=name.startsWith('hover-')?270:85;
 if(now-(last.get(name)||0)<minGap)return false;
 last.set(name,now);
 try{
  const a=getSample(name),player=a.paused?a:a.cloneNode(true);
  player.volume=name.startsWith('hover-')?.085:name==='lose'?.18:.16;
  player.currentTime=0;const outcome=player.play();outcome?.catch?.(()=>{});return true;
 }catch{return false}
}
