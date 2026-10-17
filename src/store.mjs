const KEY='guess-the-predator-2:daybreak-v1';
export function freshStore(){return {version:2,days:{},practice:{},settings:{audio:true,motion:true,playStyle:'signal',rush:false},history:{bestScore:0,wins:0}};}
export function loadStore(storage=null){
  try {
    const raw=(storage??globalThis.localStorage).getItem(KEY);const data=raw?JSON.parse(raw):null;
    if(data?.version!==2||!data?.days||!data?.practice)return freshStore();
    return {...freshStore(),...data,settings:{...freshStore().settings,...data.settings},history:{...freshStore().history,...data.history}};
  } catch {return freshStore();}
}
export function saveStore(state,storage=null){try{(storage??globalThis.localStorage).setItem(KEY,JSON.stringify(state));}catch{/* private mode still plays */}}
export const STORE_KEY=KEY;
