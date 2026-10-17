import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {LOCATIONS,mapShots} from '../src/maps.mjs';
import {dayMapSelection,findVerifiedMapImages,verifiedMapEntries,verifyImage} from '../src/map_runtime.mjs';
import {dayCount,streak,MODES} from '../src/engine.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
test('map pool does not contain entries without photographic references',()=>{
 assert.ok(verifiedMapEntries.length>=15);
 for(const entry of verifiedMapEntries)assert.ok(mapShots(entry).length>0);
 for(const entry of LOCATIONS.filter(p=>!verifiedMapEntries.includes(p)))assert.deepEqual(mapShots(entry),[]);
});
test('map preflight only returns successfully loaded sources',async()=>{
 const entries=verifiedMapEntries.slice(0,3);
 const allow=mapShots(entries[1])[0];
 const verified=await findVerifiedMapImages(entries,async url=>url===allow);
 assert.deepEqual(verified,[{entry:entries[1],url:allow}]);
 assert.equal(dayMapSelection('2026-10-17',verified.map(x=>x.entry)).id,entries[1].id);
 assert.equal(dayMapSelection('2026-10-17',[]),null);
});
test('image verifier rejects no Image object',async()=>{
 assert.equal(await verifyImage('https://example.invalid/no.jpg',null),false);
});
test('core daily goal accepts 5 if Map is offline without fake 6/6',()=>{
 const core=MODES.filter(m=>m!=='map'),finished=Object.fromEntries(core.map(m=>[m,{won:true}]));
 assert.equal(dayCount(finished,core),5);
 assert.equal(streak({'2026-10-16':finished},'2026-10-17',core).best,1);
});
test('Soft Blur buttons actually accepted, Daily action only in Daily, lighter game skin ships',()=>{
 const app=read('src/app.mjs');
 assert.match(app,/\['mosaic','soft','holo'\]\.includes\(button\.dataset\.style\)/);
 assert.match(app,/session==='daily'\?`<button data-action="home-daily"/);
 assert.ok(read('index.html').includes('lightshift-v25.css'));
 assert.ok(read('.github/workflows/pages.yml').includes('lightshift-v25.css dist'));
 assert.ok(read('lightshift-v25.css').includes('radial-gradient(ellipse at 84%'));
});
