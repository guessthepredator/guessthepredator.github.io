import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {LOCATIONS,mapShots} from '../src/maps.mjs';
import {freshStore} from '../src/store.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const content=path=>readFileSync(resolve(root,path),'utf8');

test('Pinkshift theme is deployed as a real CSS file',()=>{
 assert.ok(existsSync(resolve(root,'pinkshift.css')));
 assert.ok(content('index.html').includes('pinkshift.css?v=2.3.0'));
 assert.ok(content('.github/workflows/pages.yml').includes('styles.css pinkshift.css'));
 assert.ok(content('pinkshift.css').includes('.gtp2-hero{width:100%;border:0!important'));
});
test('genuine local multiple-angle loader avoids external Map hotlinks',()=>{
 assert.equal(LOCATIONS.length,36);
 for(const entry of LOCATIONS){
  assert.equal(entry.kind==='Interior'||entry.kind==='Exterior',true);
  for(const asset of mapShots(entry))assert.ok(asset.startsWith('./assets/maps/')||asset.startsWith('./assets/map-recon/'));
  assert.ok(mapShots(entry).at(-1).endsWith(entry.id+'.svg'));
 }
 assert.ok(content('src/maps.mjs').includes('mapMediaManifest'));
});
test('14 original WAVs are present and valid files',()=>{
 const names=['hover-classic','hover-pixel','hover-quote','hover-ability','hover-emoji','hover-map','nav','pick','clue','wrong','correct','win','lose','reveal'];
 for(const name of names){const buffer=readFileSync(resolve(root,`assets/sfx/${name}.wav`));assert.equal(buffer.toString('ascii',0,4),'RIFF');assert.equal(buffer.toString('ascii',8,12),'WAVE');assert.ok(buffer.length>1500);}
 assert.equal(freshStore().settings.audio,true);
 assert.ok(content('src/app.mjs').includes('data-action="sound-test"'));
});
test('Media Studio supports multiple local images plus rights opt-in and manifests',()=>{
 const page=content('MEDIA_STUDIO.html');
 assert.ok(page.includes('multiple></label>'));
 assert.ok(page.includes('8 capture angles'));
 assert.ok(page.includes('id="rights"'));
 assert.ok(page.includes('src/map_media_manifest.mjs'));
 assert.ok(page.includes('src/ability_media_manifest.mjs'));
 assert.ok(page.includes('src/voice_manifest.mjs'));
});
test('disclaimer and publication risk disclosure are present',()=>{
 assert.ok(content('RIGHTS_AND_GITHUB_AUDIT.md').includes('HIGH RISK'));
 assert.ok(content('README.md').includes('Not endorsed')||content('README.md').includes('Not endorsed'.toLowerCase()));
 assert.ok(content('src/app.mjs').includes('not endorsed by or affiliated with EA'));
});
