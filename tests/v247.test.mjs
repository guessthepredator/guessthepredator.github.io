import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const app=read('src/app.mjs'),css=read('styles-v245.css'),html=read('index.html');
const home=app.split('function home(){')[1].split('function homeLegacy(){')[0];
test('V2.47 removes the question glyph without breaking live wheel action',()=>{
 assert.ok(home.includes('data-action="wheel"'));
 assert.ok(!home.includes('<span>?</span></span><span class="gtp222-wheel-illustration"'));
 assert.ok(css.includes('gtp222-wheel .gtp222-dock-copy'));
 assert.ok(css.includes('width:105px!important;height:105px!important'));
});
test('V2.47 balances home edges, moon and centre bloom',()=>{
 assert.ok(css.includes('brightness(.88) contrast(1.08)'));
 assert.ok(css.includes('linear-gradient(90deg,#08070a4e'));
 assert.ok(css.includes('opacity:.72!important;mix-blend-mode:screen'));
 assert.ok(css.includes('drop-shadow(0 0 8px #e7232785)'));
});
test('V2.47 simplifies all six Home mode captions without removing portraits or actions',()=>{
 assert.equal((home.split('const showcase=[')[1].split('];')[0].match(/id:'[^']+'/g)||[]).length,6);
 assert.ok(home.includes('gtp242-mode-medallion')&&home.includes('gtp246-orbit-mode'));
 assert.ok(css.includes('.gtp242-host-name{display:none!important}'));
 assert.ok(css.includes('border:none!important;background:none!important;box-shadow:none!important'));
});
test('V2.47 removes extra characters and heavy borders across game modes',()=>{
 assert.ok(css.includes('gtp241-scene-host,'));
 assert.ok(css.includes('gtp240-mode-identity{display:none!important}'));
 assert.ok(css.includes('#app[data-screen="game"] .gtp230-titlebar'));
 assert.ok(css.includes('#app[data-screen="game"] .gtp236-intel-column>.gtp235-rules'));
 assert.ok(app.includes('function cinematicIdentityBoard(round,target)'));
});
test('V2.47 Pixel stage scaled visually, logic untouched',()=>{
 assert.ok(css.includes('[data-mode="pixel"] .gtp230-main-clue .visual-pixel .pixel-canvas'));
 assert.ok(css.includes('width:88%!important;height:88%!important'));
 assert.ok(app.includes("const sizes=[9,12,17,29,48,100,900]"));
});
test('V2.47 refreshes browser assets and retains daily progress',()=>{
 assert.ok(html.includes('styles-v245.css?v=2.46.0&amp;ui=2.51.0'));
 assert.ok(html.includes('&amp;rev=2.46.0&amp;ui=2.51.0'));
 assert.ok(app.includes('loadStore()')&&!app.includes('localStorage.clear()'));
});

test('V2.49: scan information always visible and home moon removed',()=>{ const game=app.split('function game(){')[1].split('function howTo(){')[0]; const home=app.split('function home(){')[1].split('function homeLegacy(){')[0]; assert.ok(game.includes('gtp249-visible-signals')); assert.ok(game.includes('class="gtp248-scan-details"')); assert.ok(game.indexOf('gtp249-visible-signals')<game.indexOf('gtp248-scan-details')); assert.ok(!home.includes('gtp239-blood-moon')); assert.ok(!home.includes('gtp239-bin-aura')); assert.ok(css.includes('repeat(6,minmax(0,1fr))')); });
