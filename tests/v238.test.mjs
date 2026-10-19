import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
const read=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const app=read('src/app.mjs'), css=read('styles.css'), html=read('index.html');
const home=app.split('function home(){')[1].split('function homeLegacy(){')[0];
test('V2.38 restores exactly two decorative Mirage home figures',()=>{
 assert.ok(home.includes('gtp238-mirage-left'));
 assert.ok(home.includes('gtp238-mirage-right'));
 assert.ok(css.includes("mirage-duo-side.webp"));
 assert.ok(css.includes('.gtp238-mirage-duo{'));
 assert.ok(css.includes('pointer-events:none'));
});
test('V2.39 real in-game mythic bin is bundled, not tiny vector outline',()=>{
 assert.ok(home.includes('mythic-bin-halloween-v257.webp'));
 assert.ok(!home.includes('gtp237-mythic-bin'));
 assert.ok(home.includes('gtp239-bin-image'));
 assert.ok(statSync(new URL('../assets/decor/mythic-bin-halloween-v257.webp',import.meta.url)).size>3000);
});
test('V2.38 Legend mode guides do not reveal the random answer',()=>{
 const expected={classic:'mirage',pixel:'sparrow',quote:'loba',ability:'octane',emoji:'wattson',trivia:'crypto',wheel:'pathfinder'};
 for(const [mode,slug] of Object.entries(expected)){
  assert.ok(app.includes(mode+":{slug:'"+slug+"'"),mode+' guide');
  assert.ok(css.includes('data-host="'+slug+'"')||mode==='wheel',mode+' palette');
 }
 assert.ok(home.includes('modeHostBadge(mode)'));
 assert.ok(home.includes('data-action="'));
 assert.ok(!home.includes('round.answer'));
});
test('Full Scan Sparrow, One Signal Loba, Rush Octane remain interactive',()=>{
 const rules=app.split('function visibleRoundModes(round){')[1].split('function triedLegendNote')[0];
 for(const name of ['SPARROW','LOBA','OCTANE'])assert.ok(rules.includes(name),name);
 for(const cls of ['scan-full','scan-signal','scan-rush'])assert.ok(rules.includes(cls));
 assert.ok(rules.includes('round.guesses.length>0'));
 assert.ok(rules.includes("session==='daily'"));
});
test('Game headers show mode host and preserve cinematic game wallpaper',()=>{
 assert.ok(app.includes('gtp238-game-host-label'));
 assert.ok(app.includes('gtp233-viewport-art'));
 assert.ok(css.includes('.gtp238-game-host'));
 assert.ok(css.includes('data-mode="classic"'));
 assert.ok(html.includes('styles.css?v=2.43.0'));
 assert.ok(html.includes('app.mjs?v=2.43.0'));
 assert.ok(app.includes("leaderboard.mjs?v=2.43.0"));
});
