import { createClient } from 'npm:@supabase/supabase-js@2.57.0';
import {legends} from './_shared/data.mjs';
import {MODES,puzzleAnswers,gameScore} from './_shared/engine.mjs';

const ORIGIN='*';
const headers={'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Headers':'authorization, apikey, x-client-info, content-type','Access-Control-Allow-Methods':'POST,OPTIONS'};
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{...headers,'Content-Type':'application/json'}});
const validName=(name:unknown)=>typeof name==='string'&&/^[A-Za-z0-9 _-]{3,18}$/.test(name);
const UTC=()=>new Date().toISOString().slice(0,10);
const midnightUTC=(day:string)=>Date.parse(day+'T00:00:00.000Z');
const validGuesses=(values:unknown)=>Array.isArray(values)&&values.every(x=>typeof x==='string'&&legends.some(l=>l.name===x))&&new Set(values).size===values.length;
export default {
 async fetch(request:Request){
  if(request.method==='OPTIONS')return new Response(null,{headers});
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  const auth=request.headers.get('Authorization')||'';
  const token=auth.startsWith('Bearer ')?auth.slice(7):'';
  if(!token||request.headers.get('Content-Length')&&Number(request.headers.get('Content-Length'))>15000)return json({error:'Unauthorized/too large'},401);
  const endpoint=Deno.env.get('SUPABASE_URL')||'';
  const publicKey=Deno.env.get('SUPABASE_ANON_KEY')||'';
  const serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
  if(!endpoint||!publicKey||!serviceKey)return json({error:'Server is not configured'},503);
  const authClient=createClient(endpoint,publicKey,{auth:{persistSession:false}});
  const {data:{user},error:userError}=await authClient.auth.getUser(token);
  if(userError||!user)return json({error:'Invalid user session'},401);
  let body:any;
  try{body=await request.json();}catch{return json({error:'Invalid JSON'},400);}
  if(!validName(body?.displayName)||body?.day!==UTC()||!body?.rounds||Object.keys(body.rounds).length!==MODES.length)return json({error:'Invalid name or challenge date'},400);
  const expected=puzzleAnswers(body.day,legends);
  let base=0,allWon=true;
  const result:Record<string,unknown>={};
  for(const mode of MODES){
   const r=body.rounds[mode];
   if(!r||!validGuesses(r.guesses)||r.guesses.length<1||r.guesses.length>6||!Array.isArray(r.hints)||r.hints.length>2||!['signal','full'].includes(r.mode)||![0,180].includes(r.timeLimit)||r.finished!==true)return json({error:`Invalid ${mode} round`},400);
   if(r.hints.some((h:any)=>!['role','gender','form','age','debut'].includes(h))||new Set(r.hints).size!==r.hints.length||r.guesses.length>(r.mode==='full'?5:6))return json({error:`Invalid ${mode} attempt limits`},400);
   const hit=r.guesses.indexOf(expected[mode]);
   // Only a last, correct guess is a win. Loss must exhaust attempts or timeout.
   const won=hit===r.guesses.length-1;
   if(hit>=0&&!won||won!==r.won||(!won&&r.guesses.length<(r.mode==='full'?5:6)&&r.loss!=='time'))return json({error:`Round result mismatch (${mode})`},400);
   allWon&&=won;
   let seconds=0;
   if(r.timeLimit===180&&Number.isFinite(r.startedAt)&&Number.isFinite(r.finishedAt)){
    const duration=Math.max(0,Math.min(180,Math.ceil((r.finishedAt-r.startedAt)/1000)));
    seconds=Math.max(0,180-duration);
   }
   const pts=won?Math.max(100,Math.round(1460-(r.guesses.length-1)*180-r.hints.length*145+seconds*4)):0;
   base+=pts;
   result[mode]={won,guesses:r.guesses.length,hints:r.hints.length,score:pts};
  }
  const db=createClient(endpoint,serviceKey,{auth:{persistSession:false}});
  const {data:existing}=await db.from('gtp_daily_scores').select('user_id').eq('user_id',user.id).eq('day',body.day).maybeSingle();
  if(existing)return json({error:'Score already submitted for today'},409);
  const yesterday=new Date(midnightUTC(body.day)-86400000).toISOString().slice(0,10);
  const {data:previous}=await db.from('gtp_daily_scores').select('streak,all_won').eq('user_id',user.id).eq('day',yesterday).maybeSingle();
  const run=allWon?(previous?.all_won?previous.streak+1:1):0;
  const bonus=Math.round(base*Math.min(run,10)*.05);
  const {error:insertError}=await db.from('gtp_daily_scores').insert({user_id:user.id,day:body.day,display_name:body.displayName,base_score:base,streak_bonus:bonus,streak:run,all_won:allWon,round_results:result});
  if(insertError)return json({error:insertError.code==='23505'?'Already submitted': 'Could not store score'},insertError.code==='23505'?409:500);
  return json({ok:true,baseScore:base,streakBonus:bonus,totalScore:base+bonus,streak:run});
 }
};
