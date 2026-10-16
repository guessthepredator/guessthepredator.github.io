/** User-supplied authorized clips only. Never synthesize a character's voice. */
import {authorizedVoiceSlugs,authorizedVoiceExt} from './voice_manifest.mjs';
let current=null;
const supported=new Set(['mp3','wav','ogg','webm','m4a']);
export const hasVoiceClip=slug=>authorizedVoiceSlugs.includes(slug);
const voicePath=slug=>{
  const ext=(authorizedVoiceExt?.[slug]||'mp3').replace(/^\./,'').toLowerCase();
  return `./assets/voices/${encodeURIComponent(slug)}.${supported.has(ext)?ext:'mp3'}`;
};
export function stopVoice(){try{current?.pause()}catch{}current=null;}
export async function playVoice(slug){
 stopVoice();
 if(!hasVoiceClip(slug))return false;
 const a=new Audio(voicePath(slug));
 current=a;
 try{await a.play();return true}catch{return false}
}
