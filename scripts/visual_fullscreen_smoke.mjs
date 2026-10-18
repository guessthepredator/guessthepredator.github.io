/** V2.34 smoke check in actual Chromium at screenshot-size desktop viewport.
 * Fail a pull request if wallpaper is once again clipped to the game arena
 * or a legacy opaque header blocks the artwork behind navigation.
 */
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {setTimeout as sleep} from 'node:timers/promises';

const port=8765;
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{stdio:'ignore'});
let browser;
const fail=(message)=>{throw new Error(message)};
async function waitForServer(){
 for(let i=0;i<40;i++){
  try{const response=await fetch('http://127.0.0.1:'+port+'/');if(response.ok)return}catch{}
  await sleep(250);
 }
 fail('Local static web server did not become ready');
}
async function selectMode(page,mode){
 await page.evaluate(mode=>{
  // Gameplay uses a compact nav with only one PLAY entry. Return Home for
  // the complete mode selection rather than assuming in-game mode buttons.
  if(document.querySelector('#app')?.dataset.screen==='game'){
   document.querySelector('button[data-action="home"]')?.click();
  }
  const selector='button[data-action="open"][data-mode="'+mode+'"]';
  const button=document.querySelector(selector);
  if(!button)throw new Error('Could not find mode selection on Home: '+mode);
  button.click();
 },mode);
 await page.waitForFunction(mode=>document.querySelector('#app[data-screen="game"][data-mode="'+mode+'"] .gtp233-viewport-art')!==null,mode);
}
try{
 await waitForServer();
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 mkdirSync('screenshots',{recursive:true});
 const page=await browser.newPage({viewport:{width:1658,height:928},deviceScaleFactor:1});
 await page.goto('http://127.0.0.1:'+port+'/',{waitUntil:'domcontentloaded'});
 await page.waitForSelector('#app .gtp2-top');
 for(const [mode,asset] of [
  ['classic','haunted-hero.webp'],['pixel','pixel.svg'],['quote','quote.svg'],
  ['ability','ability.svg'],['emoji','emoji.svg']
 ]){
  await selectMode(page,mode);
  const result=await page.evaluate(()=>{
   const app=document.querySelector('#app');
   const art=document.querySelector('.gtp233-viewport-art');
   const nav=document.querySelector('#app > header.gtp2-top');
   const title=document.querySelector('.gtp230-game > .gtp230-titlebar');
   const arena=document.querySelector('.gtp230-arena');
   const dock=document.querySelector('.gtp230-console');
   const r=art.getBoundingClientRect();
   const style=node=>getComputedStyle(node);
   const info={
    mode:app.dataset.mode,viewport:{width:innerWidth,height:innerHeight},
    art:{x:r.x,y:r.y,width:r.width,height:r.height,backgroundImage:style(art).backgroundImage},
    nav:{background:style(nav).backgroundImage,color:style(nav).backgroundColor},
    title:{background:style(title).backgroundImage},
    arena:{background:style(arena).backgroundImage,color:style(arena).backgroundColor},
    dock:{background:style(dock).backgroundImage,bottom:dock.getBoundingClientRect().bottom}
   };
   return info;
  });
  if(result.art.x>1||result.art.y>1||result.art.width<1656||result.art.height<926)
   fail(mode+': wallpaper is not full viewport '+JSON.stringify(result.art));
  if(!result.art.backgroundImage.includes(asset))
   fail(mode+': missing its own full-screen art '+result.art.backgroundImage);
  if(!result.nav.background.includes('rgba('))
   fail(mode+': navbar has an opaque blocking fill '+result.nav.background);
  if(!result.title.background.includes('rgba('))
   fail(mode+': mode titlebar is not a translucent HUD '+result.title.background);
  if(result.arena.background!=='none')
   fail(mode+': stage re-paints cropped second wallpaper '+result.arena.background);
  if(result.dock.bottom>929)
   fail(mode+': Submit actions pushed below 928px desktop viewport '+result.dock.bottom);
  await page.screenshot({path:'screenshots/v234-'+mode+'-desktop.png',fullPage:false});
  console.log('PASS '+mode+': full viewport wallpaper behind nav and readable HUD, dock bottom='+result.dock.bottom);
 }
 await page.setViewportSize({width:390,height:844});
 await selectMode(page,'classic');
 const mobile=await page.evaluate(()=>{
  const a=document.querySelector('.gtp233-viewport-art').getBoundingClientRect();
  return {left:a.left,top:a.top,width:a.width,height:a.height,viewport:innerWidth};
 });
 if(mobile.left>1||mobile.top>1||mobile.width<389||mobile.height<842)
  fail('Mobile wallpaper not full viewport: '+JSON.stringify(mobile));
 await page.screenshot({path:'screenshots/v234-classic-mobile.png',fullPage:true});
 console.log('PASS mobile: full viewport wallpaper and scrollable controls');
}finally{
 await browser?.close();
 server.kill();
}
