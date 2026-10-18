import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const app=read('src/app.mjs');
const html=read('index.html');
const style=read('styles-v243.css');
const home=app.split('function home(){')[1].split('function homeLegacy(){')[0];
const modes=['classic','pixel','quote','ability','emoji'];
test('V2.43 restores a consistent set of 6 Home portrait cards without touching actions',()=>{
  const cardList=home.split('const showcase=[')[1].split('];')[0];
  assert.deepEqual([...cardList.matchAll(/id:'([^']+)'/g)].map(x=>x[1]),[...modes.slice(0,2),'quote','ability','emoji','trivia']);
  assert.ok(home.includes('gtp242-mode-medallion'));
  assert.ok(style.includes('.gtp242-mode-medallion[data-host="loba"]'));
  assert.ok(app.includes('reliableIconFallbacks'),'Loba must keep the verified fallback icon source');
  assert.ok(style.includes('object-fit:cover!important'));
});
test('V2.43 styles are maintained in a separate, cache-busted stylesheet',()=>{
  assert.ok(html.includes('styles-v243.css?v=2.43.0'));
  assert.ok(html.includes('styles.css?v=2.43.0'));
  assert.ok(html.includes('app.mjs?v=2.43.0'));
  assert.ok(app.includes('leaderboard.mjs?v=2.43.0'));
});
test('V2.43 gives all five games independent cinematic corrections',()=>{
  for(const mode of modes){
    assert.ok(style.includes('data-mode="'+mode+'"'),mode+' theme missing');
    assert.ok(style.includes('gtp242-scene'),mode+' fullbody scene shared layout missing');
  }
  assert.ok(style.includes('gtp230-main-clue')&&style.includes('gtp236-intel-column'));
  assert.ok(style.includes('gtp230-console'));
  assert.ok(style.includes('data-screen="trivia"'));
});
test('V2.43 only presentation changes: full Scan, One Signal, Rush and private answer remain',()=>{
  assert.ok(app.includes('gtp235-rule-choice'));
  assert.ok(app.includes('function cinematicIdentityBoard('));
  assert.ok(app.includes('function trivia(){'));
  assert.ok(!app.includes('localStorage.clear()'));
});
