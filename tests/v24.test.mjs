import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {LOCATIONS,mapShots,sourceForLocation} from '../src/maps.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
test('Eclipse CSS linked and deployed',()=>{
 assert.ok(read('index.html').includes('eclipse-v24.css'));assert.ok(read('.github/workflows/pages.yml').includes('eclipse-v24.css'));
});
test('POI source references do not silently fall back to non-game illustrations',()=>{
 assert.equal(LOCATIONS.length,36);
 for(const loc of LOCATIONS){
  const sources=mapShots(loc);
  assert.ok(sources.every(url=>url.startsWith('https://apexlegends.wiki.gg/')||url.startsWith('./assets/maps/')));
  assert.ok(sourceForLocation(loc).startsWith('https://apexlegends.wiki.gg/'));
 }
});
test('user upload studio deleted from publish and from source',()=>{
 assert.ok(!existsSync(resolve(root,'MEDIA_STUDIO.html')));assert.ok(!read('src/app.mjs').includes('MEDIA_STUDIO'));
 assert.ok(!read('.github/workflows/pages.yml').includes('MEDIA_STUDIO'));
});
test('Pixel offers soft blur, mosaic and signal without fragments mask',()=>{
 const app=read('src/app.mjs');assert.ok(app.includes('SOFT BLUR'));assert.ok(app.includes('MOSAIC'));assert.ok(app.includes('SIGNAL'));
 assert.ok(read('eclipse-v24.css').includes('px-effect-soft'));assert.ok(!app.includes("'fragments','◇ FRAGMENTS'"));
});
test('SFX are local WAVs and no TTS impersonation',()=>{
 const app=read('src/app.mjs');assert.ok(!app.includes('speechSynthesis'));
 const files=['nav','pick','clue','wrong','correct','win','lose','reveal','hover-classic','hover-pixel','hover-quote','hover-ability','hover-emoji','hover-map'];
 for(const file of files){const wav=readFileSync(resolve(root,`assets/sfx/${file}.wav`));assert.equal(wav.toString('ascii',0,4),'RIFF');}
});
test('GitHub Actions announcer installation occurs only once',()=>{
 assert.equal(read('.github/workflows/pages.yml').split('install_cc0_announcer.py --auto').length-1,1);
});
