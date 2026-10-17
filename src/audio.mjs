/** Pinkshift Reloaded sound deck — original WAV files authored for this project.
 * No extracted EA voice recordings, soundtrack, or branded audio are included.
 */
const clips=Object.freeze({
 nav:'nav',pick:'pick',clue:'clue',wrong:'wrong',correct:'correct',win:'win',lose:'lose',reveal:'reveal',
 'hover-classic':'hover-classic','hover-pixel':'hover-pixel','hover-quote':'hover-quote',
 'hover-ability':'hover-ability','hover-emoji':'hover-emoji','hover-map':'hover-map'
});
const bank=new Map();const lastAt=new Map();
function sample(name){
 const key=clips[name]||'nav';
 if(!bank.has(key)){
  const audio=new Audio(`./assets/sfx/${key}.wav`);
  audio.preload='auto';
  bank.set(key,audio);
 }
 return bank.get(key);
}
export function preloadSoundDeck(){
 ['hover-classic','hover-pixel','hover-quote','hover-ability','hover-emoji','hover-map','nav','pick'].forEach(sample);
}
export function playSound(name,enabled=true){
 if(!enabled)return false;
 const now=Date.now();
 if(now-(lastAt.get(name)||0)<(name.startsWith('hover-')?125:55))return false;
 lastAt.set(name,now);
 try{
   const original=sample(name);
   const a=original.paused?original:original.cloneNode();
   a.volume=name.startsWith('hover-')?.15:.27;
   a.currentTime=0;
   const result=a.play();
   if(result?.catch)result.catch(()=>{/* Browser requires a user click to unlock audio. */});
   return true;
 }catch{return false;}
}
