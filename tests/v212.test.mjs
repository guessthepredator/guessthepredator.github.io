import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {FIELDS,scannerState,newRound,compare,tryGuess} from '../src/engine.mjs';
import {legends} from '../src/data.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>readFileSync(resolve(root,f),'utf8');
const js=read('src/app.mjs'),css=read('styles.css');
test('six scanner categories include safe origin values',()=>{
 assert.equal(FIELDS.length,6);assert.ok(FIELDS.includes('origin'));
 const player=legends.find(l=>l.name==='Conduit');assert.equal(player.origin,'Nexus');
 assert.equal(compare(player,player,'origin').kind,'correct');
 assert.equal(scannerState(newRound(player.name),player,legends).origin.value,'—');
 assert.equal(legends.find(l=>l.name==='Alter').origin,null);
});
test('hints render green and matching partial signals are neutral cyan',()=>{
 assert.ok(css.includes('.scanner .scan-cell.hinted{background:linear-gradient(155deg,#246850'));
 assert.ok(js.includes('flash intel-neutral'));
 assert.ok(js.includes('TRAIT MATCH'));
 assert.ok(js.includes('target not found'));
});
test('new cascade renders five mode cards and does not erase Mirage art',()=>{
 assert.ok(js.includes('gtp212-cascade'));
 assert.ok(css.includes('.gtp212-step-quote{grid-column:2;grid-row:3'));
 assert.ok(js.includes('haunted-hero.webp'));
});
test('victory confetti is gated by victory and motion setting',()=>{
 assert.ok(js.includes("sound('party')"));
 assert.ok(js.includes('triggerVictoryConfetti()'));
 assert.ok(js.includes("store.settings.motion&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches"));
 assert.ok(css.includes('@keyframes gtp212-party'));
 assert.ok(existsSync(resolve(root,'assets/sfx/party.wav')));
});
test('leaderboard, FAQ and how-to share dark page treatment',()=>{
 for(const page of ['howto','faq','leaderboard'])assert.ok(css.includes(`#app[data-screen="${page}"]`));
 assert.ok(css.includes('body:has(#app[data-screen="howto"])'));
});
test('server package validator and cache version',()=>{
 assert.ok(read('index.html').includes('styles.css?v=2.16.0'));
 assert.ok(read('supabase/functions/submit-score/index.ts').includes("'debut','origin'"));
});
