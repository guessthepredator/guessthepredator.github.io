/** V2.39 homepage screenshot and interaction checks at user's original desktop resolution. */
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {setTimeout as sleep} from 'node:timers/promises';
const port=8766,host='http://127.0.0.1:'+port+'/';
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{stdio:'ignore'});
let browser;
const assert=(ok,message)=>{if(!ok)throw new Error(message)};
try{
 for(let i=0;i<40;i++){try{if((await fetch(host)).ok)break}catch{}await sleep(250)}
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 mkdirSync('screenshots',{recursive:true});
 const page=await browser.newPage({viewport:{width:1658,height:928},deviceScaleFactor:1});
 await page.goto(host,{waitUntil:'domcontentloaded'});
 await page.waitForSelector('.gtp239-home');
 await page.evaluate(()=>document.querySelector('#identity-backdrop [data-action="identity-skip"]')?.click());
 await page.waitForTimeout(750);
 const desktop=await page.evaluate(()=>{
  const rect=s=>{const n=document.querySelector(s);if(!n)return null;const r=n.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}};
  const cards=[...document.querySelectorAll('.gtp239-mode-card')].map(n=>{
   const r=n.getBoundingClientRect(),p=n.querySelector('.gtp239-mode-ring')?.getBoundingClientRect();
   return {name:n.querySelector('strong')?.textContent,action:n.dataset.action,width:r.width,bottom:r.bottom,portraitWidth:p?.width};
  });
  return {bodyWidth:document.documentElement.scrollWidth,viewport:innerWidth,moon:rect('.gtp239-blood-moon'),
   masthead:rect('.gtp239-masthead'),bin:rect('.gtp239-bin-stage'),cards,
   mirages:document.querySelectorAll('.gtp239-mirage-figure').length,
   dock:rect('.gtp239-home-dock'),
   background:getComputedStyle(document.querySelector('.gtp239-home .gtp219-backdrop')).filter,
   secondary:document.querySelectorAll('.gtp239-more-modes .gtp222-orbit-card').length};
 });
 assert(desktop.bodyWidth<=1659,'Home scrolls horizontally: '+JSON.stringify(desktop));
 assert(desktop.cards.length===6,'Expected six featured modes: '+desktop.cards.length);
 assert(desktop.cards.every(x=>x.width>=125&&x.portraitWidth>=79&&x.portraitWidth<=90&&x.bottom<=929),'Home portraits should be compact (about 84px) and cards remain visible: '+JSON.stringify(desktop.cards));
 assert(desktop.bin?.width>=470&&desktop.bin?.height>=220,'Supply bin not prominent enough '+JSON.stringify(desktop.bin));
 assert(desktop.mirages===2,'Expected both original Mirage figures');
 assert(desktop.secondary===0,'Original modes must be primary, not hidden in a secondary section');
 assert(await page.locator('.gtp241-mystery-badge').count()===1,'Next Game Legend must use the new question-mark icon');
 assert((await page.locator('.gtp219-footer').innerText()).trim().includes('Made by Sebyby'),'Footer credit missing');
 assert(!(await page.locator('.gtp219-footer').innerText()).includes('Not affiliated'),'Footer must show only the creator credit');
 assert(await page.locator('.gtp241-spotlight-art').count()===1,'Legend of the Day full-figure art missing');

 assert(desktop.cards.map(x=>x.name).join('|')==='CLASSIC MODE|PIXEL MODE|QUOTE MODE|ABILITY MODE|EMOJI MODE|TRIVIA','Home must show original six modes in order: '+JSON.stringify(desktop.cards));
 assert(desktop.dock?.bottom<=1000,'Dock pushed too far down: '+JSON.stringify(desktop.dock));
 await page.screenshot({path:'screenshots/v239-home-desktop-1658x928.png',fullPage:true});
 console.log('PASS desktop hero geometry',JSON.stringify(desktop));

 const hosts={classic:'MIRAGE',pixel:'SPARROW',quote:'LOBA',ability:'OCTANE',emoji:'WATTSON'};
 const accents={classic:'#ff7469',pixel:'#4ce4ee',quote:'#c993ff',ability:'#b7f95e',emoji:'#ffd27b'};
 for(const [mode,legend] of Object.entries(hosts)){
  await page.evaluate(mode=>document.querySelector('.gtp239-mode-card[data-action="open"][data-mode="'+mode+'"]')?.click(),mode);
  await page.waitForSelector('#app[data-screen="game"][data-mode="'+mode+'"] .gtp240-mode-identity');
  const actual=await page.evaluate(()=>{
    const node=document.querySelector('#app');
    return {legend:document.querySelector('.gtp240-mode-identity-copy b')?.textContent.trim(),
      accent:getComputedStyle(node).getPropertyValue('--gtp230-accent').trim(),
      banner:document.querySelector('.gtp240-themed-titlebar')?.getBoundingClientRect().height,
      wallpaper:!!document.querySelector('.gtp233-viewport-art'),
      modes:[...document.querySelectorAll('.gtp235-rule-choice')].map(x=>x.textContent.trim())};
  });
  assert(actual.legend===legend,'Game '+mode+' should be hosted by '+legend+' but got '+JSON.stringify(actual));
  assert(actual.accent.toLowerCase()===accents[mode],mode+' missing its own theme color: '+JSON.stringify(actual));
  assert(actual.banner>55&&actual.wallpaper,mode+' host header or full-screen wallpaper is missing');
  const scenic=await page.locator('#app[data-screen="game"] > .gtp241-mode-scene');
  assert(await scenic.count()===1,mode+' has no character environmental scene');
  assert(await scenic.locator('img[data-portrait]').getAttribute('data-portrait')===({classic:'mirage',pixel:'sparrow',quote:'loba',ability:'octane',emoji:'wattson'})[mode],mode+' scene portrait mismatch: '+JSON.stringify(actual));

  await page.waitForFunction(()=>{
    const img=document.querySelector('#app[data-screen="game"] > .gtp242-scene .gtp242-fullbody-host img');
    return img?.complete&&img.naturalWidth>=150&&img.naturalHeight>img.naturalWidth*1.20;
  },null,{timeout:20000});
  const environment=await page.evaluate(()=>{
    const img=document.querySelector('#app[data-screen="game"] > .gtp242-scene .gtp242-fullbody-host img');
    const icon=getComputedStyle(img.closest('.portrait-holder')).opacity;
    return {source:img.currentSrc.split('/').slice(-1)[0],width:img.naturalWidth,height:img.naturalHeight,opacity:icon};
  });
  assert(environment.height>environment.width*1.2,mode+' uses a cropped square thumbnail instead of full-body artwork: '+JSON.stringify(environment));
  console.log('PASS full-body scenic art '+mode+' '+JSON.stringify(environment));
  assert(actual.modes.length===3,mode+' must keep Full Scan / One Signal / Rush settings');
  if(mode==='pixel'){
    await page.waitForFunction(()=>{
      const c=document.querySelector('#app[data-screen="game"][data-mode="pixel"] .pixel-canvas.loaded');
      return Boolean(c&&c.width<=12&&c.height>=5);
    },null,{timeout:20000});
    console.log('PASS Pixel actually renders the first clue to the pixel canvas instead of blank panel');
  }
  await page.screenshot({path:'screenshots/v240-'+mode+'-legend-theme.png',fullPage:false});
  await page.evaluate(()=>document.querySelector('button[data-action="home"]')?.click());
  await page.waitForSelector('.gtp239-home');
 }
 await page.evaluate(()=>document.querySelector('.gtp239-mode-card[data-action="trivia"]')?.click());
 await page.waitForSelector('#app[data-screen="trivia"] .gtp240-trivia-host');
 const triviaHost=await page.evaluate(()=>document.querySelector('.gtp240-trivia-host img')?.dataset.portrait);
 assert(triviaHost==='crypto','Trivia should have Crypto identity, got '+triviaHost);
 assert(await page.locator('#app[data-screen="trivia"] > .gtp241-trivia-scene img[data-portrait="crypto"]').count()===1,'Crypto environment illustration missing');
 await page.waitForFunction(()=>{
   const img=document.querySelector('#app[data-screen="trivia"] > .gtp242-trivia-environment img[data-portrait="crypto"]');
   return img?.complete&&img.naturalWidth>=150&&img.naturalHeight>img.naturalWidth*1.2;
 },null,{timeout:20000});
 console.log('PASS Crypto full-body scene image loaded before screenshot');


 await page.screenshot({path:'screenshots/v240-trivia-crypto-theme.png',fullPage:false});
 await page.evaluate(()=>document.querySelector('button[data-action="home"]')?.click());
 await page.waitForSelector('.gtp239-home');
 console.log('PASS six original home modes and five distinct themed games + Crypto Trivia');
 await page.setViewportSize({width:390,height:844});
 await page.waitForTimeout(250);
 const mobile=await page.evaluate(()=>({
  viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,
  cards:document.querySelectorAll('.gtp239-mode-card').length,
  portraitWidth:document.querySelector('.gtp239-mode-ring')?.getBoundingClientRect().width,
  stage:document.querySelector('.gtp239-bin-stage')?.getBoundingClientRect().width,
  button:document.querySelector('.gtp239-open-intel')?.getBoundingClientRect().width
 }));
 assert(mobile.scrollWidth<=391,'Horizontal mobile overflow: '+JSON.stringify(mobile));
 assert(mobile.cards===6&&mobile.stage>=325&&mobile.button>=200,'Mobile home incomplete: '+JSON.stringify(mobile));
 assert(mobile.portraitWidth>=54&&mobile.portraitWidth<=65,'Mobile icons should be about 59px, not oversized: '+JSON.stringify(mobile));
 await page.screenshot({path:'screenshots/v239-home-mobile-390x844.png',fullPage:true});
 console.log('PASS mobile home',JSON.stringify(mobile));
}finally{await browser?.close();server.kill()}
