import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const styles=read('styles-v245.css'),html=read('index.html'),flow=read('.github/workflows/pages.yml');
test('V2.52 Pixel canvas larger than V2.51 without wide stretching',()=>{
 assert.ok(styles.includes('max-width:485px!important'));assert.ok(styles.includes('max-height:334px!important'));
 assert.ok(styles.includes('aspect-ratio:1.38!important'));assert.ok(styles.includes('image-rendering:pixelated!important'));
});
test('V2.52 Ability reserves shorter arena, keeping scanner on initial viewport',()=>{
 assert.ok(styles.includes('[data-mode="ability"] .gtp230-arena'));assert.ok(styles.includes('grid-template-rows:clamp(395px,47svh,500px) auto!important'));
 assert.ok(styles.includes('height:335px!important'));assert.ok(styles.includes('[data-mode="ability"] .gtp249-visible-signals'));
});
test('V2.52 cache and CI suite',()=>{
 assert.equal((html.match(/ui=2\.\d+\.0/g)||[]).length,2);assert.ok(flow.includes('tests/v252.test.mjs'));
});