import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const app=read('src/app.mjs'),css=read('styles-v245.css'),html=read('index.html'),flow=read('.github/workflows/pages.yml');
const home=app.split('function home(){')[1].split('function homeLegacy(){')[0];
test('V2.46 floating clickable mode guides preserve six playable modes',()=>{
 assert.equal((home.split('const showcase=[')[1].split('];')[0].match(/id:'[^']+'/g)||[]).length,6);
 for(const mark of ['gtp246-home-arena','gtp246-orbit-mode','gtp246-intel-hub','gtp239-bin-image'])assert.ok(home.includes(mark),mark);
 assert.ok(css.includes('mirage-clean-final.webp'));
 assert.ok(css.includes('gtp239-mirage-duo{display:none!important}'));
});
test('V2.46 console is truly overlaid and hint rules remain',()=>{
 assert.ok(css.includes('grid-template-areas:"clue intel"'));
 assert.ok(css.includes('grid-area:clue!important;grid-row:1!important;grid-column:1!important'));
 assert.ok(app.includes('function visibleRoundModes(round)'));
});
test('V2.46 settings still uses functional volume and sound/motion toggles',()=>{
 assert.ok(app.includes('gtp246-settings-drawer'));
 assert.ok(app.includes('id="gtp237-volume"'));
 for(const a of ['audio','motion','sound-preview'])assert.ok(app.includes('data-action="'+a+'"'));
});
test('V2.46 fresh CSS and app entrypoint in build',()=>{
 assert.ok(html.includes('styles-v245.css?v=2.46.0'));
 assert.ok(html.includes('&amp;rev=2.46.0'));
 assert.ok(flow.includes('tests/v246.test.mjs'));
});
