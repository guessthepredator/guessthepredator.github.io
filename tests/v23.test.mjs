import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {LOCATIONS,mapShots} from '../src/maps.mjs';
import {freshStore} from '../src/store.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=(path)=>readFileSync(resolve(root,path),'utf8');

test('Catalog holds 36 POIs but map mode only considers source-backed ones',()=>{
 assert.equal(LOCATIONS.length,36);
 const sources=LOCATIONS.filter(poi=>mapShots(poi).length);
 assert.ok(sources.length>=15);
 for(const poi of LOCATIONS){assert.ok(mapShots(poi).every(src=>!src.includes('/map-recon/')));}
});
test('six gameplay modes have distinct local backgrounds',()=>{
 for(const mode of ['classic','pixel','quote','ability','emoji','map']){
  assert.ok(existsSync(resolve(root,`assets/game-bg/${mode}.svg`)));
  assert.ok(read('dark-pink-v23.css').includes(`game-bg/${mode}.svg`));
 }
});
test('no artificial eyes, generic replacement portraits or robotic voices',()=>{
 const src=read('src/app.mjs');
 assert.ok(!src.includes('id="mirage-gaze"'));
 assert.ok(!src.includes('speechSynthesis'));
 assert.ok(!src.includes('HUMAN VOICE FILE NOT INSTALLED'));
 assert.ok(!existsSync(resolve(root,'src/concept_map_manifest.mjs')));
 assert.ok(!existsSync(resolve(root,'assets/legends')));
});
test('optional licensed human announcer and text-only Quote are separate',()=>{
 assert.ok(read('src/announcer.mjs').includes('announcerAvailable'));
 assert.ok(read('src/app.mjs').includes('NO VOICE IMPERSONATION'));
 assert.ok(read('scripts/install_cc0_announcer.py').includes('kenney.nl/assets/voiceover-pack'));
 assert.ok(read('scripts/install_cc0_announcer.py').includes("'female'"));
 assert.equal(freshStore().settings.announcer,true);
});
test('repository actions have cleanup and nonfatal CC0 voice fetch',()=>{
 const workflow=read('.github/workflows/pages.yml');
 assert.ok(workflow.includes('clean_old_release.py'));
 assert.ok(workflow.includes('install_cc0_announcer.py --auto'));
 assert.ok(workflow.includes('dark-pink-v23.css'));
});
