import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const js=read('src/app.mjs'),css=read('styles.css'),html=read('index.html');
const home=js.split('function home(){')[1].split('function homeLegacy(){')[0];
test('V2.42 preserves six original modes and makes six matching branded medallions',()=>{
 const m=[...home.split('const showcase=[')[1].split('];')[0].matchAll(/id:'([^']+)'/g)].map(x=>x[1]);
 assert.deepEqual(m,['classic','pixel','quote','ability','emoji','trivia']);
 for(const marker of ['gtp242-mode-medallion','gtp242-ring-detail','gtp242-ring-notch','gtp242-mode-plate','gtp242-host-name'])assert.ok(home.includes(marker),marker);
 assert.ok(css.includes('.gtp242-mode-medallion')&&css.includes('width:87px!important;height:87px!important'));
 assert.ok(css.includes('.gtp242-mode-plate')&&css.includes('gtp242-mode-medallion[data-host="loba"]'));
});
test('V2.42 prioritizes actual full-body Legend artwork for environment, never square icon art first',()=>{
 assert.ok(js.includes("const isSceneArt=Boolean(image.closest('.gtp241-scene-host,.gtp241-trivia-scene,.gtp241-spotlight-art'))"));
 assert.ok(js.includes('const preferredFullBody=isSceneArt'));
 assert.ok(js.includes("sourceCatalog.filter(url=>!url.includes('moeneri/astrbot_plugin_apexrankwatch/'))"));
 assert.ok(js.includes("localFile?[`./assets/portraits/${localFile}`]"));
 assert.ok(css.includes('.portrait-icon-fallback{opacity:0!important}'));
 assert.ok(js.includes('gtp242-fullbody-host')&&js.includes('gtp242-scenery'));
 for(const m of ['classic','pixel','quote','ability','emoji'])assert.ok(css.includes('gtp241-scene-'+m),m);
});
test('V2.42 environmental scene is layered, readable, and compact on mobile',()=>{
 assert.ok(css.includes('.gtp242-scene .gtp242-fullbody-host'));
 assert.ok(css.includes('object-fit:contain!important'));
 assert.ok(css.includes('gtp242-scene .gtp241-scene-label'));
 assert.ok(css.includes('display:none!important'));
 assert.ok(css.includes('var(--gtp230-back)!important'));
 assert.ok(css.includes('pointer-events:none!important'));
 assert.ok(css.includes('@media(max-width:700px)'));
});
test('V2.42 keeps separate Crypto scene, Mystery Wheel and saved progress',()=>{
 assert.ok(js.includes('gtp242-trivia-environment'));
 assert.ok(js.includes('tac258-wheel-face'));
 assert.ok(js.includes('loadStore()')&&!js.includes('localStorage.clear()'));
 assert.ok(html.includes('styles.css?v=2.43.0')&&html.includes('app.mjs?v=2.43.0'));
 assert.ok(js.includes('leaderboard.mjs?v=2.43.0'));
});
