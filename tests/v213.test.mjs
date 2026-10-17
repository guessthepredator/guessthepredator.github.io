import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newRound,scannerState,formatValue,tryGuess} from '../src/engine.mjs';
import {legends} from '../src/data.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const app=read('src/app.mjs'),css=read('styles.css'),html=read('index.html');
test('header and browser title omit version and retired edition',()=>{
 assert.ok(!html.includes('Aurora Cascade')&&!html.includes('AURORA CASCADE')&&!html.includes('V2.12'));
 assert.ok(app.includes('seby-apex-mark')&&!app.includes('AURORA CASCADE · V2.12'));
 assert.ok(app.includes('Made by Sebyby'));
});
test('hero dock contains wheel left, daily Intel middle, spotlight right',()=>{
 const mark=app.slice(app.indexOf('function homeFeatureDock'),app.indexOf('function modeTile'));
 assert.ok(mark.indexOf('gtp213-dock-wheel')<mark.indexOf('gtp213-dock-intel'));
 assert.ok(mark.indexOf('gtp213-dock-intel')<mark.indexOf('gtp213-dock-legend'));
 assert.ok(app.includes('${homeFeatureDock()}'));assert.ok(!app.includes('SCROLL FOR EXTRAS'));
 assert.ok(css.includes('.gtp213-dock{order:5'));
});
test('scanner unknown is neutral before a guess and amber when attempted',()=>{
 const target=legends.find(l=>l.origin==null);assert.ok(target);
 assert.equal(scannerState(newRound(target.name),target,legends).origin.value,'—');
 const first=legends.find(l=>l.name!==target.name);
 const after=tryGuess(newRound(target.name),first.name,legends,10000);
 assert.equal(scannerState(after,target,legends).origin.kind,'unknown');
 assert.equal(scannerState(after,target,legends).origin.value,'UNKNOWN');
 assert.equal(formatValue(null,'origin'),'—');
 assert.ok(css.includes('.scanner .scan-cell.unknown{background:linear-gradient(150deg,#483716'));
});
test('pixel soft only, rush 120 seconds, legacy 180 support',()=>{
 assert.ok(app.includes("const effect='soft'"));assert.ok(!app.includes('▦ MOSAIC'));assert.ok(!app.includes('⌁ SIGNAL'));
 assert.ok(app.includes('◌ SOFT BLUR'));
 assert.equal(newRound('Mirage','signal',120).timeLimit,120);
 assert.equal(newRound('Mirage','signal',180).timeLimit,180);
 assert.ok(app.includes('round.timeLimit?0:120'));
 assert.ok(read('supabase/functions/submit-score/index.ts').includes('[0,120,180]'));
});
test('wheel without class or exclusion and renamed next-game title',()=>{
 assert.ok(app.includes('NEXT GAME <em>LEGEND.</em>'));
 assert.ok(!app.includes('id="wheel-class"'));assert.ok(!app.includes('data-wheel-exclude'));
 assert.ok(!app.includes('EXCLUDE LEGENDS FROM THE WHEEL'));
 assert.ok(app.includes('id="wheel-repeat"'));
});
test('quote decor gone and ability icon enlarged, centered',()=>{
 assert.ok(!app.includes('<div class="gtp2-quote-lines"'));
 assert.ok(css.includes('.clue-visual.gtp29-quote-visual::before'));
 assert.ok(css.includes('width:min(238px,58%)!important'));
});
