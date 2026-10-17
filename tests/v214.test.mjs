import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {legends} from '../src/data.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const app=read('src/app.mjs'),css=read('styles.css'),html=read('index.html');
const home=app.slice(app.indexOf('function home(){'),app.indexOf('function getVisual('));
test('v2.14 cache bust and clean single site identity',()=>{
 assert.match(html,/app\.mjs\?v=2\.15\.0/);
 assert.match(html,/styles\.css\?v=2\.15\.0/);
 assert.ok(!home.includes('<h1>GUESS THE'));
 assert.ok(app.includes('Made by Sebyby'));
});
test('forbidden intel uses a dedicated first-row featured panel',()=>{
 assert.ok(home.includes('${homeIntelPanel()}'));
 const dock=app.slice(app.indexOf('function homeFeatureDock(){'),app.indexOf('function modeTile('));
 assert.ok(dock.includes('gtp214-dock')&&dock.includes('gtp213-dock-wheel')&&dock.includes('gtp213-dock-legend'));
 assert.ok(!dock.includes('gtp213-dock-intel'));
 assert.ok(css.includes('.nova27-home .gtp215-intel-feature{'));
 assert.ok(home.indexOf('${homeIntelPanel()}') < home.indexOf('gtp212-cascade'));
});
test('redundant home controls removed and contrast toggles remain',()=>{
 assert.ok(!home.includes('gtp28-rank-btn')&&!home.includes('CONTINUE DAILY'));
 assert.ok(home.includes('gtp2-session'));
 assert.ok(css.includes('.nova27-home .gtp2-session button.active{background:linear-gradient(130deg,#c1d7da'));
});
test('softened background and palette that is not pink',()=>{
 assert.ok(css.includes('brightness(.71) saturate(.67)'));
 assert.ok(css.includes('background:linear-gradient(110deg,#111f2de8'));
 assert.ok(app.includes("classic:'#71c8bb'"));
 assert.ok(css.includes('.nova27-home .gtp2-hero-content:before{animation:none'));
});
test('prominent and centered mode controls',()=>{
 assert.ok(css.includes('.style-options .segment{min-width:125px'));
 assert.ok(css.includes('background:linear-gradient(135deg,#79b9ac,#90ccd0)'));
 assert.ok(app.includes('CHOOSE YOUR SCAN'));
});
test('consistent transparent character images support local full-body art without invented resources',()=>{
 assert.equal(legends.length,28);
 assert.ok(existsSync(new URL('../assets/portraits/README.md',import.meta.url)));
 assert.ok(app.includes('localPortraitFiles[slug]'));
 assert.ok(existsSync(new URL('../src/portrait_media_manifest.mjs',import.meta.url)));
 assert.ok(css.includes('.picker-legend .portrait-holder img'));
});
test('ability scan stays explicitly centered',()=>{
 assert.ok(css.includes('.gtp210-ability-core{display:flex!important'));
 assert.ok(css.includes('width:min(248px,70%)!important'));
 assert.ok(css.includes('.gtp210-scan-tag{margin:0 auto!important'));
});
