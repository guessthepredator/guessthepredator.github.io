/** Compact original UI sound deck; no copyrighted in-game voice lines.
 * Sample playback stays compatible with the existing 14 .wav files.
 * WebAudio adds soft, differentiated mode chimes without network assets.
 */
const modes=['classic','pixel','quote','ability','emoji'];
const events=new Set(['nav','pick','clue','wrong','correct','win','party','victory','lose','reveal',...modes.map(mode=>'hover-'+mode)]);
const buffers=new Map(),last=new Map();
let ctx=null,master=null;let currentVolume=.7;
function audioEngine(){
  if(ctx)return ctx;
  const Ctor=globalThis.AudioContext||globalThis.webkitAudioContext;
  if(!Ctor)return null;
  try{
    ctx=new Ctor();master=ctx.createGain();master.gain.value=.34*currentVolume;
    master.connect(ctx.destination);return ctx;
  }catch{return null;}
}
function tone(frequency,duration=.12,{shape='sine',level=.045,delay=0,pan=0}={}){
 const ac=audioEngine();if(!ac)return;
 try{
  if(ac.state==='suspended')void ac.resume().catch(()=>{});
  const at=ac.currentTime+delay,osc=ac.createOscillator(),env=ac.createGain();
  osc.type=shape;osc.frequency.setValueAtTime(frequency,at);
  env.gain.setValueAtTime(.0001,at);
  env.gain.exponentialRampToValueAtTime(Math.max(.001,level),at+.018);
  env.gain.exponentialRampToValueAtTime(.0001,at+duration);
  if(typeof ac.createStereoPanner==='function'){
   const stereo=ac.createStereoPanner();stereo.pan.value=pan;osc.connect(env);env.connect(stereo);stereo.connect(master);
  }else{osc.connect(env);env.connect(master)}
  osc.start(at);osc.stop(at+duration+.025);
 }catch{/* Browser audio unlock policy */ }
}
function melody(name){
 const hover=modes.indexOf(name.replace('hover-',''));
 if(name.startsWith('hover-')&&hover>=0){
  const pitch=[440,523.25,392,587.33,659.25][hover];
  tone(pitch,.075,{shape:'sine',level:.030,pan:(hover-2)*.14});return;
 }
 if(name==='clue'||name==='correct'){
  tone(530,.11,{level:.05});
  tone(793,.16,{delay:.062,level:.039});return;
 }
 if(name==='wrong'){
  tone(325,.13,{shape:'triangle',level:.046});
  tone(252,.16,{shape:'triangle',delay:.07,level:.032});return;
 }
 // A dedicated, original sparkling victory fanfare for successful Legend guesses.
 // Distinct from UI success chimes; triggered alongside confetti, but audio
 // remains available if reduced-motion accessibility disables confetti.
 if(name==='victory'){
  const melodyNotes=[523.25,659.25,783.99,1046.50,1318.51];
  const offsets=[0,.095,.19,.29,.43];
  melodyNotes.forEach((frequency,i)=>tone(frequency,i===4?.55:.20,{
   shape:i===4?'sine':'triangle',delay:offsets[i],
   level:i===4?.082:.055,pan:[-.4,.35,-.2,.3,0][i]
  }));
  // A soft shimmering double-sparkle after the ascending fanfare.
  tone(1567.98,.24,{shape:'sine',level:.027,delay:.48,pan:-.52});
  tone(1975.53,.36,{shape:'sine',level:.024,delay:.61,pan:.48});
  tone(783.99,.43,{shape:'sine',level:.031,delay:.46,pan:.05});
  return;
 }
 if(name==='win'||name==='party'){
  tone(523,.17,{level:.06});tone(659,.21,{delay:.09,level:.05});tone(784,.29,{delay:.18,level:.045});return;
 }
 if(name==='reveal'){
  tone(392,.21,{level:.033});tone(587,.3,{delay:.08,level:.04});tone(880,.36,{delay:.18,level:.036});return;
 }
 if(name==='lose'){tone(330,.14,{shape:'triangle',level:.038});tone(262,.21,{delay:.11,shape:'triangle',level:.03});return;}
 if(name==='pick'){tone(622,.07,{level:.036});return;}
 if(name==='nav'){tone(470,.065,{level:.028});}
}
function getSample(name){
 const key=events.has(name)?name:'nav';
 if(!buffers.has(key)){const file=new Audio(`./assets/sfx/${key}.wav`);file.preload='auto';buffers.set(key,file)}
 return buffers.get(key);
}
export function preloadSoundDeck(){['nav','pick','reveal','party'].forEach(getSample)}
export function playSound(name,enabled=true,volume=.7){
 currentVolume=Math.max(0,Math.min(1,Number(volume)||0));
 if(master&&ctx)master.gain.setTargetAtTime(.34*currentVolume,ctx.currentTime,.015);
 if(!enabled||currentVolume<=0)return false;
 const now=performance.now(),key=events.has(name)?name:'nav',minGap=key.startsWith('hover-')?310:95;
 if(now-(last.get(key)||0)<minGap)return false;
 last.set(key,now);
 try{
  if(key!=='victory'){
   const a=getSample(key),player=a.paused?a:a.cloneNode(true);
   // Victory uses an ORIGINAL generated fanfare, not the old party sample.
   player.volume=key==='party'?.12:key.startsWith('hover-')?.028:key==='lose'?.11:key==='wrong'?.06:key==='clue'?.08:.09;
   player.volume*=currentVolume;player.currentTime=0;void player.play()?.catch?.(()=>{});
  }
 }catch{/* Fallback to synthesized sound */ }
 melody(key);return true;
}
