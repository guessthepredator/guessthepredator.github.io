import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {LOCATIONS,MAPS,mapRound,mapGuess,mapShots,resolveLocation} from '../src/maps.mjs';
import {legends} from '../src/data.mjs';
import {puzzleAnswers,MODES,hash,MAX_GUESSES,FULL_SCAN_GUESSES,newRound,tryGuess,streak} from '../src/engine.mjs';
import {localAbilitySlugs,abilityCandidates} from '../src/abilities.mjs';
import {freshStore,STORE_KEY} from '../src/store.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const js=readFileSync(resolve(root,'src/app.mjs'),'utf8');
const css=readFileSync(resolve(root,'styles.css'),'utf8');
test('six modes, 28 legends, 36 unique locations and 6 maps',()=>{
 assert.equal(MODES.length,6);assert.equal(legends.length,28);assert.equal(MAPS.length,6);assert.equal(LOCATIONS.length,36);
 assert.equal(new Set(LOCATIONS.map(loc=>loc.id)).size,36);
 assert.equal(LOCATIONS.filter(loc=>loc.kind==='Interior').length>=10,true);
 for(const map of MAPS)assert.equal(LOCATIONS.filter(l=>l.map===map).length,6);
});
test('daily map can select all 36 location slots',()=>{
 const seen=new Set();for(let day=1;day<=300;day++){
  const date=new Date(Date.UTC(2026,0,day)).toISOString().slice(0,10);const a=puzzleAnswers(date,legends);
  assert.ok(a.map>=0&&a.map<36);seen.add(a.map);
 }
 assert.ok(seen.size>=33,`Only ${seen.size}/36 map indices appeared`);
});
test('map stage correctly works for interior location',()=>{
 const location=resolveLocation('ed-galleria');assert.ok(location?.poi.includes('Shopping Arcade'));
 let round=mapRound(location);round=mapGuess(round,location.map,location,100);assert.equal(round.stage,2);
 round=mapGuess(round,location.poi,location,200);assert.equal(round.finished,true);assert.equal(round.won,true);
});
test('map screenshot sources use documented remote redirect with a local fallback',()=>{
 for(const location of LOCATIONS){const sources=mapShots(location);assert.ok(sources.length>=1);assert.ok(sources.at(-1).endsWith(location.id+'.svg'));for(const src of sources)assert.ok(src.startsWith('./assets/map-recon/')||src.startsWith('https://apexlegends.wiki.gg/'))}
});
test('game rules preserved',()=>{
 assert.equal(MAX_GUESSES,6);assert.equal(FULL_SCAN_GUESSES,5);
 let round=newRound('Mirage','signal');round=tryGuess(round,'Octane',legends,1000);assert.equal(round.guesses.length,1);
});
test('GTP2 does not reuse old local save key',()=>{assert.ok(STORE_KEY.includes('predator-2'));assert.ok(!STORE_KEY.includes('candycore'));assert.equal(freshStore().version,2)});
test('one menu-free background and zero artificial eye canvases',()=>{
 assert.equal(js.split('id="mirage-gaze"').length-1,0);assert.ok(js.includes('gtp2-backdrop'));
 assert.ok(existsSync(resolve(root,'assets/decor/haunted-hero.webp')));
 assert.ok(!js.includes('mirage-halloween-eyes-base.png'));
 assert.ok(css.includes('.gtp2-hero{width:100%'));
});
test('eight legitimate ability icons only',()=>{
 assert.equal(localAbilitySlugs.length,8);
 for(const slug of localAbilitySlugs){assert.ok(abilityCandidates(slug).length);assert.ok(existsSync(resolve(root,`assets/ability-icons/${slug}.png`)))}
});
test('Media Studio removed; Quote is text-only and has no imitation voice',()=>{
 assert.ok(js.includes('NO VOICE IMPERSONATION'));assert.ok(!js.includes('MEDIA_STUDIO.html'));
 assert.ok(!js.includes('HUMAN VOICE FILE NOT INSTALLED'));
 assert.ok(!existsSync(resolve(root,'MEDIA_STUDIO.html')));
});
