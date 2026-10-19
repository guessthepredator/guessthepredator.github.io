import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {newRound,tryGuess,scannerState,FIELDS} from '../src/engine.mjs';import {legends} from '../src/data.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const app=read('src/app.mjs'),html=read('index.html'),css=read('styles-v245.css'),wf=read('.github/workflows/pages.yml');
test('Full Scan preserves matches across guesses',()=>{
 const target=legends.find(l=>l.name==='Mirage');
 const first=legends.find(l=>l.name!==target.name&&FIELDS.some(f=>l[f]!=null&&l[f]===target[f]));
 const shared=FIELDS.find(f=>first[f]!=null&&first[f]===target[f]);
 const second=legends.find(l=>l.name!==target.name&&l.name!==first.name&&l[shared]!=null&&l[shared]!==target[shared]);
 assert.ok(second);
 let round=tryGuess(newRound(target.name,'full'),first.name,legends,1000);
 const green=scannerState(round,target,legends)[shared];assert.equal(green.kind,'correct');
 round=tryGuess(round,second.name,legends,2000);
 assert.equal(scannerState(round,target,legends)[shared].kind,'correct');
 assert.equal(scannerState(round,target,legends)[shared].value,green.value);
});
test('Latest mismatches on unconfirmed fields remain different',()=>{
 const target=legends.find(l=>l.name==='Mirage');
 const first=legends.find(l=>l.name!==target.name);
 let round=tryGuess(newRound(target.name,'full'),first.name,legends,1000);
 const wrongField=FIELDS.find(f=>scannerState(round,target,legends)[f].kind==='wrong');assert.ok(wrongField);
 const second=legends.find(l=>l.name!==target.name&&l.name!==first.name&&l[wrongField]!=null&&l[wrongField]!==target[wrongField]);
 round=tryGuess(round,second.name,legends,2000);
 assert.equal(scannerState(round,target,legends)[wrongField].kind,'wrong');
});
test('Renamed brand and rule explanations are included in the published app',()=>{
 assert.ok(html.includes('<title>The Apex Challenge'));
 assert.ok(app.includes('THE APEX<strong>CHALLENGE</strong>'));
 assert.ok(app.includes('<h1>CHALLENGE</h1>'));
 assert.ok(app.includes('CONFIRMED MATCHES ARE REMEMBERED'));
 assert.ok(app.includes('Correct matches stay green'));
 assert.ok(css.includes('V2.53 — renamed brand'));
 assert.equal((html.match(/ui=2\.\d+\.0/g)||[]).length,2);
 assert.ok(wf.includes('tests/v253.test.mjs'));
});