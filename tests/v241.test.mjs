import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PIXEL_SIZES} from '../src/pixel_scene.mjs';
const file=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const app=file('src/app.mjs'),css=file('styles.css'),html=file('index.html');
const home=app.split('function home(){')[1].split('function homeLegacy(){')[0];
const gameplay=app.split('function game(){')[1].split('function records(){')[0];
const guide=app.split('function howTo(){')[1].split('function trivia(){')[0];

test('V2.41 retains six original Home modes, uniform styling, and new mystery wheel',()=>{
 const names=[...home.split('const showcase=[')[1].split('];')[0].matchAll(/id:'([^']+)'/g)].map(x=>x[1]);
 assert.deepEqual(names,['classic','pixel','quote','ability','emoji','trivia']);
 assert.ok(home.includes('tac258-wheel-face'));
 assert.ok(!home.includes('gtp238-wheel-host"'));
 assert.ok(home.includes('tac258-portrait'));
 assert.ok(home.includes('mythic-bin-halloween-v257.webp'));
 assert.ok(home.includes(' Made by Sebyby'));
 assert.ok(!home.includes('Not affiliated with EA or Respawn'));
 assert.ok(css.includes('.gtp239-mode-card .gtp239-mode-ring'));
 assert.ok(css.includes('width:84px!important;height:84px!important'));
});
test('V2.41 assigns distinct portrait-based scenic art to ALL five game modes',()=>{
 const hosts=['mirage','sparrow','loba','octane','wattson'];
 for(const mode of ['classic','pixel','quote','ability','emoji']){
  assert.ok(css.includes('gtp241-scene-'+mode),'missing mode scene '+mode);
 }
 for(const host of hosts)assert.ok(app.includes("slug:'"+host+"'"));
 assert.ok(gameplay.includes('gtp241-mode-scene'));
 assert.ok(gameplay.includes('portrait(host.slug'));
 assert.ok(gameplay.includes('gtp233-viewport-art'));
 assert.ok(css.includes('gtp241-scene-host img'));
 assert.ok(css.includes('pointer-events:none!important'));
});
test('V2.41 gives Crypto environmental scene, not just header',()=>{
 assert.ok(app.includes('gtp241-trivia-scene'));
 assert.ok(app.includes("portrait('crypto'"));
 assert.ok(css.includes('#app[data-screen="trivia"]>.gtp241-trivia-scene'));
});
test('V2.41 Pixel reveal is slightly harder while still solvable',()=>{
 assert.deepEqual(PIXEL_SIZES,[9,12,17,29,48,100,900]);
});
test('V2.41 How To and FAQ cover all six modes, updated rules and reward progression',()=>{
 for(const s of ['CLASSIC � MIRAGE','PIXEL � SPARROW','QUOTE � LOBA','ABILITY � OCTANE','EMOJI � WATTSON','TRIVIA � CRYPTO','FORBIDDEN INTEL','RUSH','SETTINGS','UTC'])assert.ok(guide.includes(s),s);
 assert.ok(guide.includes('five questions'));
 assert.ok(guide.includes('At 00:00 UTC')||guide.includes('at 00:00 UTC'));
});
test('V2.41 keeps progress and private game answers intact',()=>{
 assert.ok(app.includes('loadStore()'));assert.ok(!app.includes('localStorage.clear()'));
 assert.ok(html.includes('styles.css?v=2.43.0')&&html.includes('app.mjs?v=2.43.0'));
 assert.ok(app.includes("leaderboard.mjs?v=2.43.0"));
});
