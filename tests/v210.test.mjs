import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>readFileSync(resolve(root,name),'utf8');
const app=read('src/app.mjs'),css=read('styles.css'),html=read('index.html');
test('Emoji visual uses five numbered, unlockable cards rather than old circular screen',()=>{
  assert.ok(app.includes('gtp210-emoji-slots'));
  assert.ok(app.includes('gtp210-emoji-tile'));
  assert.ok(app.includes('gtp210-reveal-track'));
  assert.ok(app.includes("const shown=Math.min(all.length,3+Math.floor(round.guesses.length/2))"));
  assert.ok(css.includes('.clue-visual.gtp210-emoji-stage::before'));
  assert.ok(css.includes('content:none!important'));
});
test('Ability visual retains real local images with a high-contrast stage',()=>{
  assert.ok(app.includes('gtp210-ability-icon'));
  assert.ok(app.includes('data-ability="${esc(target.slug)}"'));
  assert.ok(css.includes('.gtp210-ability-icon img'));
  for(const name of ['alter','bangalore','catalyst','fuse','gibraltar','lifeline','loba','revenant']){
    assert.ok(existsSync(resolve(root,'assets/ability-icons',name+'.png')));
  }
});
test('Both modes have explicit dark gradients and isolated pseudo-elements',()=>{
  assert.ok(css.includes('#app[data-screen="game"] .gtp2-game-scene .clue-visual.gtp210-ability-stage'));
  assert.ok(css.includes('#app[data-screen="game"] .gtp2-game-scene .clue-visual.gtp210-emoji-stage'));
  assert.ok(css.includes('.gtp210-emoji-tile.is-visible'));
});
test('V2.12 cache busters and saved nickname are preserved',()=>{
  assert.ok(html.match(/styles\.css\?v=\d+\.\d+\.\d+/));
  assert.ok(html.match(/app\.mjs\?v=\d+\.\d+\.\d+/));
  assert.ok(app.includes('function identityPrompt()'));
  assert.ok(app.includes('function submitScores()'));
  assert.ok(read('src/leaderboard_config.mjs').includes('pupdfltjeyzhnyrxutvt'));
});
