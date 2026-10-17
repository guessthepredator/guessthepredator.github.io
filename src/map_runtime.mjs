/** Guardrail: a Map round may begin only with a loaded, real location screenshot.
 * No generated sketches, unrelated shots, or text-only substitute in the answer pool.
 */
import {LOCATIONS,mapShots} from './maps.mjs?v=2.6.0';
export const verifiedMapEntries=LOCATIONS.filter(e=>mapShots(e).some(url=>!url.includes('/map-recon/')));
export const dayMapSelection=(day,ready)=>{
  if(!ready.length)return null;
  const value=String(day).split('').reduce((n,c)=>Math.imul(n^c.charCodeAt(0),16777619)>>>0,2166136261);
  return ready[value%ready.length];
};
export async function verifyImage(url,Loader=globalThis.Image,timeout=7000){
  if(!Loader)return false;
  return new Promise(resolve=>{
    const img=new Loader();let finished=false;
    const stop=(ok)=>{if(finished)return;finished=true;clearTimeout(timer);img.onload=img.onerror=null;resolve(ok);};
    const timer=setTimeout(()=>stop(false),timeout);
    img.onload=()=>stop(img.naturalWidth>=400&&img.naturalHeight>=230);
    img.onerror=()=>stop(false);
    img.src=url;
  });
}
export async function findVerifiedMapImages(entries=verifiedMapEntries,test=verifyImage){
  const output=[];
  // One network image per POI. Only verified photographs enter the playable pool.
  await Promise.all(entries.map(async entry=>{
    for(const url of mapShots(entry)){
      if(url.includes('/map-recon/'))continue;
      if(await test(url)){output.push({entry,url});return;}
    }
  }));
  return output.sort((a,b)=>a.entry.id.localeCompare(b.entry.id));
}
