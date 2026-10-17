import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
const read=x=>readFileSync(new URL('../'+x,import.meta.url),'utf8');
const app=read('src/app.mjs'),css=read('styles.css'),html=read('index.html');
const home=app.split('function home(){')[1].split('function homeLegacy(){')[0];
test('clean character backdrop is bundled and uniquely used by live homepage',()=>{
 assert.ok(statSync(new URL('../assets/decor/mirage-clean-final.webp',import.meta.url)).size>150000);
 assert.ok(css.includes('mirage-clean-final.webp'));
 assert.ok(home.includes('gtp219-backdrop'));
 for(const old of ['gtp218-wallpaper','gtp217-graphic','gtp216-mirage-left','haunted-hero.webp'])assert.ok(!home.includes(old));
});
test('game mode cards real HTML and correct five actions, no cropped screenshot art',()=>{
 for(const m of ['classic','pixel','quote','ability','emoji'])assert.ok(home.includes(`'${m}'`));
 for(const marker of ['gtp219-mode-pattern','gtp219-mode-glyph','gtp219-mode-title','data-action="open"','data-session="unlimited"'])assert.ok(home.includes(marker));
 assert.ok(!home.includes('gtp218-mode-classic.webp'));
});
test('both daily checkpoints and all main interactive surfaces wired',()=>{
 for(const action of ['home-daily','session','intel-open','wheel','leaderboard','howto','faq','audio','profile'])assert.ok(home.includes(`data-action="${action}"`));
 assert.ok(home.includes('gtp219-rewards'));assert.ok(home.includes('gtp219-dock-portrait'));
});
test('browse portraits consistently rendered without false full-body files',()=>{
 assert.ok(css.includes('#app .gtp2-picker .picker-legend .portrait-holder'));
 assert.ok(css.includes('object-fit:contain!important'));
 assert.ok(app.includes('localPortraitFiles[slug]'));
 const manifest=read('src/portrait_media_manifest.mjs'); assert.ok(manifest.includes('localPortraitFiles=Object.freeze({})'));
});
test('mode accents and stable release cache versions',()=>{
 for(const m of ['classic','pixel','quote','ability','emoji'])assert.ok(css.includes(`[data-mode="${m}"]`));
 assert.ok(html.includes('styles.css?v=2.21.0'));
 assert.ok(html.includes('app.mjs?v=2.21.0'));
 assert.ok(app.includes("app.dataset.mode=screen==='game'?active:''"));
});
