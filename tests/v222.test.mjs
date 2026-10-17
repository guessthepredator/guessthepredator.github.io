import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newRound,tryGuess,scannerState,FIELDS,compare} from '../src/engine.mjs';
import {legends} from '../src/data.mjs';
import {freshStore,loadStore,saveStore} from '../src/store.mjs';
const read=x=>readFileSync(new URL('../'+x,import.meta.url),'utf8');
const app=read('src/app.mjs'),css=read('styles.css'),html=read('index.html');
const home=app.split('function home(){')[1].split('function homeLegacy(){')[0];
test('only one header is rendered on all screens with HOME nav',()=>{
 assert.ok(app.includes('app.innerHTML=nav()+'));
 assert.ok(home.includes('gtp222-layout')&&!home.includes('gtp219-header'));
 assert.ok(app.includes('data-action="home">⌂ HOME'));
 assert.ok(css.includes('#app[data-screen="home"]>.gtp2-top{display:flex!important'));
});
test('six cards orbit around a single central reward hub',()=>{
 assert.ok(home.includes('gtp222-arena')&&home.includes('gtp222-core'));
 for(const mode of ['classic','pixel','quote','ability','emoji','trivia'])assert.ok(home.includes(`'${mode}'`));
 assert.ok(home.includes('data-action="wheel"')&&home.includes('gtp222-wheel-illustration'));
 assert.ok(home.includes('data-action="intel-open"')&&home.includes('gtp222-primary-actions'));
});
test('full scan remembers trait matches from first guess after later mismatch',()=>{
 const target=legends.find(l=>l.name==='Mirage');
 const first=legends.find(l=>l.name!==target.name && FIELDS.some(f=>l[f]!=null&&l[f]===target[f]));
 assert.ok(first);
 const matched=FIELDS.filter(f=>lMatch(first,target,f));
 assert.ok(matched.length);
 let round=newRound(target.name,'full');round=tryGuess(round,first.name,legends,1000);
 const second=legends.find(l=>l.name!==target.name && l.name!==first.name && matched.some(f=>l[f]!==target[f]));
 assert.ok(second);round=tryGuess(round,second.name,legends,2000);
 const state=scannerState(round,target,legends);
 for(const field of matched)assert.equal(state[field].kind,'correct');
 assert.ok(app.includes('gtp222-locked-chip')&&app.includes('gtp222-scan-history'));
});
function lMatch(a,b,f){return a[f]!=null&&a[f]===b[f];}
test('saved days, stats and submission receipts survive reload',()=>{
 const map=new Map(),storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};
 let st=freshStore();st.history.wins=17;st.days['2026-10-17']={daily218:{full:{finished:true,won:true}}};st.submittedDays['2026-10-17']={totalScore:2440};saveStore(st,storage);
 const again=loadStore(storage);assert.equal(again.history.wins,17);assert.equal(again.days['2026-10-17'].daily218.full.won,true);assert.equal(again.submittedDays['2026-10-17'].totalScore,2440);
 assert.ok(app.includes('SAVED_BOARD_KEY')&&app.includes('LAST SAVED RESULTS VISIBLE'));
});
test('priority 10 legends try Original model renders before square portraits',()=>{
 const art=read('src/art.mjs');for(const name of ['Vantage','Sparrow','Rampart','Revenant','Loba','Gibraltar','Conduit','Catalyst','Ballistic','Alter'])assert.ok(art.includes('Original%20'+name+'.png'));
 assert.ok(css.includes('.portrait-model-render'));
});
test('release assets share updated cache version and old Supabase APIs remain',()=>{
 assert.ok(html.includes('styles.css?v=2.22.0')&&html.includes('app.mjs?v=2.22.0'));
 assert.ok(read('src/leaderboard.mjs').includes("sb.rpc('get_overall_leaderboard'"));
 assert.ok(read('src/leaderboard.mjs').includes("sb.rpc('gtp_trivia_api'"));
});
