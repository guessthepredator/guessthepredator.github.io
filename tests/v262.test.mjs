import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8'),css=readFileSync(new URL('../styles-v245.css',import.meta.url),'utf8');
function pixel(round){const fn=app.slice(app.indexOf('function getVisual('),app.indexOf('function quickModeLinks('));return vm.runInNewContext(fn+'getVisual(round,target)',{active:'pixel',round,target:{name:'Sparrow',slug:'sparrow',role:'Recon',title:'Tracker',signature:'Tracking',emoji:'a b c',extraEmoji:['d','e']},portrait:()=>'<img>',maxGuesses:r=>r.mode==='full'?5:6,esc:s=>s});}
test('a first-guess Pixel win is fully revealed at resolution 900 with zero blur',()=>{
 const html=pixel({won:true,finished:true,guesses:['Sparrow'],mode:'full'});
 assert.match(html,/pixel-revealed/);assert.match(html,/data-resolution="900"/);assert.match(html,/--px-blur:0px/);assert.match(html,/Sparrow fully revealed/);assert.match(html,/FULLY REVEALED/);
 assert.match(css,/pixel-revealed[\s\S]*filter:none!important;image-rendering:auto!important/);
});
test('an unresolved Pixel round retains its progressive first-stage clue',()=>{
 const html=pixel({won:false,finished:false,guesses:[],mode:'full'});assert.doesNotMatch(html,/pixel-revealed/);assert.match(html,/data-resolution="9"/);assert.match(html,/--px-blur:2.4px/);
});
