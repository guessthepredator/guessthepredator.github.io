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
test('Full Scan shows latest truthful match or mismatch, never an old green override',()=>{
 const target=legends.find(l=>l.name==='Mirage');
 const first=legends.find(l=>l.name!==target.name&&FIELDS.some(f=>lMatch(l,target,f)));
 const shared=FIELDS.find(f=>lMatch(first,target,f));
 const second=legends.find(l=>l.name!==target.name&&l.name!==first.name&&l[shared]!==target[shared]&&l[shared]!=null);
 let round=tryGuess(newRound(target.name,'full'),first.name,legends,1000);
 assert.equal(scannerState(round,target,legends)[shared].kind,'correct');
 round=tryGuess(round,second.name,legends,2000);
 assert.equal(scannerState(round,target,legends)[shared].kind,'wrong');
 assert.ok(app.includes('LATEST GUESS ONLY'));
 assert.ok(!app.includes('${fullScanHistoryMarkup(round,target)}'));
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
 assert.ok(html.includes('styles.css?v=2.24.0')&&html.includes('app.mjs?v=2.24.0'));
 assert.ok(read('src/leaderboard.mjs').includes("sb.rpc('get_overall_leaderboard'"));
 assert.ok(read('src/leaderboard.mjs').includes("sb.rpc('gtp_trivia_api'"));
});

test('mode launch always uses the clicked free-play session',()=>{
 assert.ok(app.includes("openMode(button.dataset.mode,button.dataset.session||'unlimited')"));
 assert.ok(home.includes('data-session="unlimited"'));
});
test('full scan history uses past snapshots and remains visible on finished rounds',()=>{
 assert.ok(app.includes('function fullScanHistoryMarkup(round,target)'));
 assert.ok(app.includes('guesses:round.guesses.slice(0,i+1),hints:[]'));
 assert.ok(app.includes("${fullScanHistoryMarkup(round,target)}${round.mode==='full'?scannerMarkup(round,target):''}"));
});
test('partial local stores preserve progress without requiring a practice object',()=>{
 const map=new Map([['guess-the-predator-2:daybreak-v1',JSON.stringify({days:{'2026-10-17':{daily218:{full:{won:true}}}},history:{wins:7}})]]);
 const storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};
 const saved=loadStore(storage);
 assert.equal(saved.history.wins,7);
 assert.equal(saved.days['2026-10-17'].daily218.full.won,true);
 assert.deepEqual(saved.practice,{});
});

test('the three Intel checkpoints have deterministic EA-linked tips',async()=>{
 const {INTEL_POOL,intelFor}=await import('../src/daily218.mjs');
 const official=['https://help.ea.com/','https://www.ea.com/'];
 for(const idx of [1,2,3]){
  assert.ok(INTEL_POOL[idx].length>=6);
  const entry=intelFor('2026-10-17',idx);
  assert.deepEqual(entry,intelFor('2026-10-17',idx));
  assert.ok(entry.tip.length>70);
  assert.ok(official.some(prefix=>entry.source.startsWith(prefix)));
 }
});
test('read-aware Intel UI and contextual reward access are wired',()=>{
 assert.ok(app.includes('function intelState(checkpoint)'));
 assert.ok(app.includes('store.intelOpenedDays?.['));
 assert.ok(app.includes('NEW · OPEN ↗')&&app.includes('READ ✓'));
 assert.ok(app.includes("intelReadyMarkup(dailyTrack==='full'?1:2)"));
 assert.ok(app.includes('intelReadyMarkup(3)'));
 assert.ok(css.includes('gtp223-intel-ready')&&css.includes('gtp223-intel-source'));
});
test('home cards leave space for character art; game sidebars match every mode',()=>{
 for(const mode of ['classic','pixel','quote','ability','emoji'])
  assert.ok(css.includes(`[data-mode="${mode}"]{--side-tone:`));
 assert.ok(css.includes('V2.23 · SHOWCASE'));
 assert.ok(css.includes('grid-template-columns:minmax(214px,286px)'));
 assert.ok(css.includes('.gtp222-home:after'));
});

test('V2.24 orbit, full dock art, game sessions and Trivia timeout are wired',()=>{
 assert.ok(app.includes('gtp224-orbit-'));
 assert.ok(app.includes('gtp224-session-banner'));
 assert.ok(css.includes('V2.24 — true orbit'));
 assert.ok(css.includes('.gtp222-home-dock .gtp222-wheel-illustration'));
 assert.ok(css.includes('.gtp222-home-dock .gtp222-spotlight-art'));
 assert.ok(css.includes('#app[data-screen="trivia"] .trivia-page'));
 assert.ok(app.includes("requestAnimationFrame(frame)"));
 assert.ok(app.includes('TIME’S UP · QUESTION EXPIRED'));
});
test('portrait catalog attempts the same vertical source on every Legend',async()=>{
 const {portraitOriginalNames,portraitSourcesFor}=await import('../src/art.mjs');
 assert.equal(Object.keys(portraitOriginalNames).length,28);
 for(const legend of legends){
  const sources=portraitSourcesFor(legend.slug);
  assert.ok(sources[0].includes('apexlegends.wiki.gg'));
  assert.ok(sources.length>=2);
 }
});
