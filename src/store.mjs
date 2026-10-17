const KEY='guess-the-predator-2:daybreak-v1';
export function freshStore(){return {version:3,days:{},practice:{},settings:{audio:true,motion:true,playStyle:'signal',rush:false,pixelStyle:'mosaic'},history:{bestScore:0,wins:0},profile:{nickname:'',askedName:false}};}
export function loadStore(storage=null){
  try {
    const raw=(storage??globalThis.localStorage).getItem(KEY);const data=raw?JSON.parse(raw):null;
    if(!data?.days||!data?.practice)return freshStore();
    const base=freshStore();
    return {...base,...data,settings:{...base.settings,...data.settings},history:{...base.history,...data.history},profile:{...base.profile,...data.profile}};
  } catch {return freshStore();}
}
export function saveStore(state,storage=null){try{(storage??globalThis.localStorage).setItem(KEY,JSON.stringify(state));}catch{/* private mode still plays */}}
export const STORE_KEY=KEY;
