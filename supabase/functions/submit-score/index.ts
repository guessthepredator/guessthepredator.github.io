import {createClient} from 'npm:@supabase/supabase-js@2.57.0';
import {legends} from './_shared/data.mjs';
import {MODES,hash,puzzleAnswers} from './_shared/engine.mjs';


/** Offline source parity with deployed submit-score v5. Deploy separately from GitHub Pages.
 * Supports V2.18 dual challenges and legacy five-puzzle submissions during transition.
 */
const allowedOrigins=new Set(['https://the-apex-challenge.github.io','https://negoitasebastian.github.io','https://guessthepredator.github.io','http://localhost:8000','http://127.0.0.1:8000']);
const fields=new Set(['role','gender','form','age','debut','origin']);
const names=new Set(legends.map(l=>l.name));
const json=(body:unknown,status=200,origin='https://guessthepredator.github.io')=>new Response(JSON.stringify(body),{
 status,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, apikey, x-client-info, content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Vary':'Origin'}
});
const yesterday=day=>new Date(Date.parse(day+'T00:00:00Z')-86400000).toISOString().slice(0,10);
Deno.serve(async(req:Request)=>{
 const incoming=req.headers.get('Origin');if(incoming&&!allowedOrigins.has(incoming))return json({error:'Origin not allowed'},403);
 const origin=incoming||'https://guessthepredator.github.io';
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, apikey, x-client-info, content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Vary':'Origin'}});
 if(req.method!=='POST')return json({error:'Method not allowed'},405,origin);
 const bearer=req.headers.get('Authorization')||'';if(!bearer.startsWith('Bearer '))return json({error:'Authentication required'},401,origin);
 const endpoint=Deno.env.get('SUPABASE_URL')||'',secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
 if(!endpoint||!secret)return json({error:'Server configuration unavailable'},503,origin);
 let raw:string;try{raw=await req.text();}catch{return json({error:'Invalid request'},400,origin);}
 if(raw.length>16000)return json({error:'Payload too large'},413,origin);
 let payload:any;try{payload=JSON.parse(raw);}catch{return json({error:'Invalid JSON'},400,origin);}
 const day=new Date().toISOString().slice(0,10),isDual=payload?.protocol==='v218';
 const tracks=isDual?['full','signal']:MODES;
 if(typeof payload?.displayName!=='string'||!/^[A-Za-z0-9 _-]{3,18}$/.test(payload.displayName)||payload.day!==day||!payload.rounds||typeof payload.rounds!=='object'||Object.keys(payload.rounds).length!==tracks.length||tracks.some(track=>!Object.hasOwn(payload.rounds,track)))return json({error:'Invalid nickname, date or rounds'},400,origin);
 const client=createClient(endpoint,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user},error:authError}=await client.auth.getUser(bearer.slice(7).trim());
 if(authError||!user||user.is_anonymous!==true)return json({error:'Invalid anonymous session'},401,origin);
 const answers=puzzleAnswers(day,legends),pivot=hash('gtp:v218:daily:'+day)%MODES.length;
 const schedule={full:MODES[pivot],signal:MODES[(pivot+2)%MODES.length]};
 if(isDual&&(!payload.rounds.full||!payload.rounds.signal||payload.rounds.full.mode!=='full'||payload.rounds.signal.mode!=='signal'||payload.rounds.full.gameMode!==schedule.full||payload.rounds.signal.gameMode!==schedule.signal||payload.rounds.full.timeLimit!==0||payload.rounds.signal.timeLimit!==0))return json({error:'Daily track configuration mismatch'},400,origin);
 if(isDual&&(!Number.isFinite(payload.rounds.full.finishedAt)||!Number.isFinite(payload.rounds.signal.startedAt)||payload.rounds.signal.startedAt<payload.rounds.full.finishedAt))return json({error:'Daily track order invalid'},400,origin);
 let base=0,allWon=true;const details:Record<string,unknown>={};
