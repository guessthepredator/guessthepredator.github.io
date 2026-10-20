import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
const js=read('src/app.mjs'),css=read('styles.css'),html=read('index.html');
const home=js.split('function home(){')[1].split('function homeLegacy(){')[0];
const classic=['classic','pixel','quote','ability','emoji','trivia'];
const hosts={classic:'loba',pixel:'sparrow',quote:'wraith',ability:'octane',emoji:'wattson',trivia:'crypto'};
test('V2.40: all six ORIGINAL modes are primary interactive Home cards, no scan rules as modes',()=>{
 const showcase=home.split('const showcase=[')[1].split('];')[0];
 const names=[...showcase.matchAll(/id:'([^']+)'/g)].map(x=>x[1]);
 assert.deepEqual(names,classic);
 assert.equal((showcase.match(/action:'open'/g)||[]).length,5);
 assert.ok(showcase.includes("action:'trivia'"));
 for(const wrong of ["id:'full'","id:'signal'","id:'rush'","id:'wheel'"])assert.ok(!showcase.includes(wrong));
 assert.ok(!home.includes('gtp239-secondary'));
 assert.ok(home.includes('tac258-discover')&&home.includes('data-action="wheel"'));
});
test('V2.40: separate Legend is attached to each original game mode, never the answer',()=>{
 for(const [mode,slug] of Object.entries(hosts)){
  assert.ok(js.includes(mode+":{slug:'"+slug+"'"),mode+' is assigned to '+slug);
 }
 assert.ok(js.includes('gtp240-mode-identity'));
 assert.ok(js.includes('gtp240-mode-identity-art'));
 assert.ok(!home.includes('round.answer'));
});
test('V2.40: complete gameplay colors and panels differ across all modes',()=>{
 for(const mode of classic.slice(0,5)){
  assert.ok(css.includes('#app[data-screen="game"][data-mode="'+mode+'"]{'),mode);
 }
 for(const marker of ['--gtp230-accent:','--gtp230-hi:','--gtp230-aura:','--gtp240-glow:','gtp240-themed-titlebar','gtp240-mode-identity-copy','.gtp230-btn-main','.gtp230-console'])assert.ok(css.includes(marker),marker);
 assert.ok(js.includes("signature={classic:"));
 assert.ok(css.includes('--gtp230-back'), 'background art must remain');
});
test('V2.40: Trivia gets Crypto-themed real question screen',()=>{
 assert.ok(js.includes('gtp240-trivia-hero'));
 assert.ok(js.includes("portrait('crypto'"));
 assert.ok(css.includes('#app[data-screen="trivia"] .gtp240-trivia-host'));
 assert.ok(css.includes('#app[data-screen="trivia"] .trivia-page .trivia-main'));
});
test('V2.40: full scan, one signal and rush remain rule choices; Daily preserved',()=>{
 const p=js.split('function visibleRoundModes(round){')[1].split('function triedLegendNote')[0];
 for(const v of ['FULL SCAN','ONE SIGNAL','RUSH','SPARROW','LOBA','OCTANE'])assert.ok(p.includes(v));
 assert.ok(p.includes("session==='daily'")&&p.includes('round.guesses.length>0'));
 assert.ok(js.includes('data-action="home-daily"'));
});
test('V2.40: version parity, no reset/mutation of user progress',()=>{
 assert.ok(html.includes('styles.css?v=2.43.0')&&html.includes('app.mjs?v=2.43.0'));
 assert.ok(js.includes('leaderboard.mjs?v=2.43.0'));
 assert.ok(js.includes('loadStore('));
 assert.ok(!js.includes('localStorage.clear()'));
});
