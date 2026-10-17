import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {legends} from '../src/data.mjs';
import {PIXEL_SIZES,scenePalette} from '../src/pixel_scene.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=(path)=>readFileSync(resolve(root,path),'utf8');
const app=read('src/app.mjs'),style=read('styles.css');
test('home has exactly one primary CTA and separate rankings control',()=>{
 assert.ok(app.includes('gtp28-hero-footer'));
 assert.ok(app.includes('gtp28-primary-row'));
 assert.ok(app.includes('gtp28-rank-btn'));
 assert.ok(app.includes("session==='daily'"));
});
test('session switches no longer rebuild entire page',()=>{
 const start=app.indexOf("else if(action==='session')"),end=app.indexOf("else if(action==='audio')",start);
 assert.ok(start>0&&end>start);
 assert.ok(!app.slice(start,end).includes('render('));
});
test('pixel is harder and canvas background is deterministic and shared',()=>{
 assert.deepEqual(PIXEL_SIZES,[11,14,20,33,54,110,900]);
 assert.ok(read('src/pixel_scene.mjs').includes("const hue=260,variation=0"));
 assert.ok(app.includes('const sizes=[9,12,16,26,40,82,900]'));
});
test('game palette is plum and filled; no white pastel under the screenshot',()=>{
 assert.ok(style.includes('body.lightshift-playing #app[data-screen="game"]'));
 assert.ok(style.includes('linear-gradient(135deg,#171027'));
 assert.ok(style.includes('.gtp2-game-scene .btn.pink{background:linear-gradient'));
 assert.ok(style.includes('.gtp2-game-scene .clue-visual.gtp27-mystery:not(.visual-pixel):not(.gtp2-quote-rework)'));
});
test('missing Age is UNDICLOSED and guesses show inline history',()=>{
 assert.ok(read('src/engine.mjs').includes("if(value==null)return 'UNDISCLOSED'"));
 assert.ok(app.includes('gtp28-instant-history'));
});
test('28 unique emoji sets with no duplicate token among hints',()=>{
 assert.equal(legends.length,28);
 for(const l of legends){const symbols=[...l.emoji.split(/\s+/),...l.extraEmoji];assert.equal(new Set(symbols).size,symbols.length,l.name);}
});
test('all 14 sound files are present, no voice cues',()=>{
 assert.equal(readdirSync(resolve(root,'assets/sfx')).filter(s=>s.endsWith('.wav')).length,14);
 assert.ok(!app.includes('voiceCue('));
});
test('Supabase client configured only with public project key',()=>{
 const conf=read('src/leaderboard_config.mjs');assert.ok(conf.includes('https://pupdfltjeyzhnyrxutvt.supabase.co'));
 assert.ok(conf.includes('sb_publishable_'));assert.ok(!conf.includes('service_role')&&!conf.includes('sb_secret_'));
});
