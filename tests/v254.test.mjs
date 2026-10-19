import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {loadStore,saveStore,STORE_KEY} from '../src/store.mjs';
import {INTEL_POOL,intelFor} from '../src/daily218.mjs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('rebranding preserves existing practice, daily results, nickname and receipt',()=>{
 const values=new Map();const storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
 const state=loadStore(storage);
 state.settings.session='unlimited';state.profile.nickname='ExistingPlayer';
 state.days['2026-10-19']={daily218:{full:{finished:true,won:true}}};
 state.practice.pixel={answer:'Mirage',guesses:['Wraith'],finished:false};
 state.submittedDays['2026-10-18']={totalScore:500};saveStore(state,storage);
 assert.equal(STORE_KEY,'guess-the-predator-2:daybreak-v1');
 assert.deepEqual(loadStore(storage),state);
});

test('approved scene assets are full-sized WebP files and independent of gameplay geometry',()=>{
 const css=read('styles-v245.css');
 for(const mode of ['ability','pixel','quote','emoji','trivia']){
  const bytes=readFileSync(new URL('../assets/game-bg/'+mode+'-v254.webp',import.meta.url));
  assert.equal(bytes.subarray(0,4).toString(),'RIFF');assert.equal(bytes.subarray(8,12).toString(),'WEBP');
  assert.ok(bytes.length>100000&&bytes.length<600000,mode);
  assert.ok(css.includes(mode+'-v254.webp'));
 }
 assert.ok(css.includes('pointer-events:none!important;contain:strict;z-index:0!important'));
 assert.ok(existsSync(new URL('../assets/decor/mythic-bin-real-v239.webp',import.meta.url)));
});

test('Intel rotates deterministic practical notes without falsely claiming EA verification',()=>{
 for(const index of [1,2,3]){
  assert.ok(INTEL_POOL[index].length>=8);
  const first=intelFor('2026-10-19',index);
  assert.deepEqual(first,intelFor('2026-10-19',index));
  assert.ok(first.tip.length>90);
 }
 assert.ok(!read('src/app.mjs').includes('VERIFIED EA GUIDE'));
});

// Test the actual leaderboard module with a controlled SDK; no production score is submitted.
async function leaderboardWith(sdk){
 const config=read('src/leaderboard_config.mjs');
 const configUrl='data:text/javascript;base64,'+Buffer.from(config).toString('base64');
 const key='__tac_test_'+Math.random().toString(36).slice(2);globalThis[key]=sdk;
 const sdkUrl='data:text/javascript;base64,'+Buffer.from('export const createClient=()=>globalThis['+JSON.stringify(key)+'];').toString('base64');
 const source=read('src/leaderboard.mjs').replace("'./leaderboard_config.mjs'",JSON.stringify(configUrl)).replace("'https://esm.sh/@supabase/supabase-js@2.57.0'",JSON.stringify(sdkUrl));
 const mod=await import('data:text/javascript;base64,'+Buffer.from(source+'\n//'+key).toString('base64'));
 return {mod,dispose:()=>delete globalThis[key]};
}

test('simultaneous Daily and Trivia requests share one anonymous identity',async()=>{
 let session=null,signins=0,release;
 const pending=new Promise(resolve=>{release=resolve;});
 const sdk={auth:{getSession:async()=>({data:{session},error:null}),signInAnonymously:async()=>{signins++;await pending;session={access_token:'retained-player'};return {data:{session},error:null};}},functions:{invoke:async()=>({data:{ok:true},error:null})},rpc:async()=>({data:{ok:true},error:null})};
 const {mod,dispose}=await leaderboardWith(sdk);
 try{const daily=mod.submitDaily({});const trivia=mod.triviaRequest({});await new Promise(resolve=>setTimeout(resolve,10));release();await Promise.all([daily,trivia]);assert.equal(signins,1);await mod.triviaRequest({});assert.equal(signins,1);}finally{dispose();}
});

test('an existing player session is reused without creating another identity',async()=>{
 let signins=0;
 const sdk={auth:{getSession:async()=>({data:{session:{access_token:'existing'}},error:null}),signInAnonymously:async()=>{signins++;throw Error('must not create user');}},functions:{invoke:async()=>({data:{ok:true},error:null})}};
 const {mod,dispose}=await leaderboardWith(sdk);
 try{await mod.submitDaily({});assert.equal(signins,0);}finally{dispose();}
});

test('failed public ranking RPC surfaces an error without presenting an empty successful board',async()=>{
 const sdk={rpc:async name=>name==='get_daily_leaderboard'?{data:null,error:{message:'Temporarily offline'}}:{data:[],error:null}};
 const {mod,dispose}=await leaderboardWith(sdk);
 try{await assert.rejects(mod.getBoards('2026-10-19'),/Temporarily offline/);}finally{dispose();}
});
