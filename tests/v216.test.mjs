import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
const app=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const home=app.slice(app.indexOf('function home(){'),app.indexOf('function getVisual('));
const dock=app.slice(app.indexOf('function homeFeatureDock(){'),app.indexOf('function modeTile('));
const ability=app.slice(app.indexOf('if(mode===\'ability\')return'),app.indexOf('if(mode===\'emoji\')'));
test('Two decorative Mirage figures added without replacing gameplay elements',()=>{
  assert.ok(home.includes('gtp216-mirage-left')&&home.includes('gtp216-mirage-right'));
  assert.ok(home.includes('gtp216-center-clear'));
  assert.ok(home.includes('gtp215-intel-feature')===false); // provided by homeIntelPanel()
  assert.ok(home.includes('${homeIntelPanel()}'));
  assert.ok(home.includes('gtp212-cascade'));
  assert.ok(home.includes('gtp2-backdrop'));
});
test('Two side figures are locally bundled, facing opposite directions',()=>{
  assert.ok(statSync(new URL('../assets/decor/mirage-duo-side.webp',import.meta.url)).size>15000);
  assert.ok(css.includes('.gtp216-mirage-right{right:-3.5%;transform:scaleX(-1)'));
  assert.ok(css.includes('.gtp216-mirage-duo{position:absolute'));
});
test('Next Game Legend is one semantic full-card button, not nested buttons',()=>{
  assert.ok(dock.includes('<button class="gtp213-dock-card gtp213-dock-wheel gtp216-wheel-hitbox"'));
  assert.ok(dock.includes('data-action="wheel"'));
  assert.ok(dock.includes('aria-label="Spin the wheel to pick your next game Legend"'));
  assert.ok(!dock.includes('<article class="gtp213-dock-card gtp213-dock-wheel"'));
  assert.equal((dock.match(/<button/g)||[]).length,1);
});
test('Wheel includes custom graphic and live focus feedback',()=>{
  assert.ok(dock.includes('gtp216-wheel-dial'));
  assert.ok(css.includes('conic-gradient(from -17deg'));
  assert.ok(css.includes('.gtp216-wheel-hitbox:focus-visible'));
});
test('Wheel card routes to existing wheel handler, preserving live modal',()=>{
  assert.ok(app.includes("else if(action==='wheel')showWheel()"));
  assert.ok(app.includes("const button=event.target.closest('[data-action]')"));
});
test('Ability icon has centered grid aligned to stage on desktop/mobile',()=>{
  assert.ok(ability.includes('gtp210-ability-core'));
  assert.ok(css.includes('grid-template-columns:minmax(0,1fr)!important;grid-template-rows:minmax(0,1fr) 28px!important'));
  assert.ok(css.includes('.gtp210-ability-core .gtp210-ability-icon{grid-area:1/1!important'));
  assert.ok(css.includes('.gtp210-ability-core .gtp210-scan-tag{grid-area:2/1!important'));
});
test('Cache keys bumped for Github Pages; Supabase client and game files kept',()=>{
  assert.ok(index.includes('styles.css?v=2.16.0'));
  assert.ok(index.includes('app.mjs?v=2.16.0'));
  assert.ok(app.includes('leaderboard.mjs?v=2.16.0'));
  assert.ok(app.includes('store.mjs?v=2.16.0'));
});
