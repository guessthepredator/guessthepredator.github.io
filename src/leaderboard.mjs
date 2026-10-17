/** Public leaderboard client. Dynamic import only when URL/key are configured. */
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from './leaderboard_config.mjs';
let clientPromise;
export const leaderboardConfigured=()=>/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(SUPABASE_URL)&&SUPABASE_PUBLISHABLE_KEY.length>16;
async function client(){
 if(!leaderboardConfigured())throw Error('Leaderboard is not configured yet. See LEADERBOARD_SETUP.md');
 if(!clientPromise)clientPromise=import('https://esm.sh/@supabase/supabase-js@2.57.0').then(({createClient})=>createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true}}));
 return clientPromise;
}
export async function getBoards(day){
 const sb=await client();
 const [{data:daily,error:a},{data:overall,error:b}]=await Promise.all([
  sb.rpc('get_daily_leaderboard',{p_day:day,p_limit:25}),
  sb.rpc('get_overall_leaderboard',{p_limit:25}),
 ]);
 if(a||b)throw Error(a?.message||b?.message||'Leaderboard unavailable');
 return {daily:daily||[],overall:overall||[]};
}
export async function submitDaily(payload){
 const sb=await client();let {data:{session},error:sessionError}=await sb.auth.getSession();
 if(sessionError)throw sessionError;
 if(!session){const response=await sb.auth.signInAnonymously();if(response.error)throw response.error;session=response.data.session;}
 if(!session?.access_token)throw Error('Could not create anonymous leaderboard session');
 const {data,error}=await sb.functions.invoke('submit-score',{body:payload});
 if(error){let detail='';try{const response=error.context;if(response?.json){const body=await response.json();detail=typeof body?.error==='string'?body.error:'';}}catch{}throw new Error(detail||error.message||'Score submission failed');}
 if(!data?.ok)throw new Error(data?.error||'Invalid score submission');
 return data;
}
