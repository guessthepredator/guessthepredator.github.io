const KEY='guess-the-predator-2:daybreak-v1';
export function freshStore(){return {version:3,days:{},practice:{},settings:{audio:true,volume:.7,motion:true,playStyle:'signal',rush:false,pixelStyle:'soft'},history:{bestScore:0,wins:0},submittedDays:{},profile:{nickname:'',askedName:false}};}
export function loadStore(storage=null){
  try {
    const raw=(storage??globalThis.localStorage).getItem(KEY);const data=raw?JSON.parse(raw):null;
    if(!data||typeof data!=='object'||Array.isArray(data))return freshStore();
    const base=freshStore();
    return {...base,...data,days:data.days&&typeof data.days==='object'&&!Array.isArray(data.days)?data.days:{},practice:data.practice&&typeof data.practice==='object'&&!Array.isArray(data.practice)?data.practice:{},settings:{...base.settings,...data.settings,volume:Number.isFinite(Number(data.settings?.volume))?Math.min(1,Math.max(0,Number(data.settings.volume))):.7},history:{...base.history,...data.history},submittedDays:{...base.submittedDays,...data.submittedDays},profile:{...base.profile,...data.profile}};
  } catch {return freshStore();}
}
export function saveStore(state,storage=null){try{(storage??globalThis.localStorage).setItem(KEY,JSON.stringify(state));}catch{/* private mode still plays */}}
export const STORE_KEY=KEY;
