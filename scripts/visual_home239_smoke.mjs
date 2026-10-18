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
 assert(desktop.cards.every(x=>x.width>=125&&x.portraitWidth>=92&&x.bottom<=929),'Mode cards too small or clipped at user's viewport: '+JSON.stringify(desktop.cards));
 assert(desktop.bin?.width>=470&&desktop.bin?.height>=220,'Supply bin not prominent enough '+JSON.stringify(desktop.bin));
 assert(desktop.mirages===2,'Expected both original Mirage figures');
 assert(desktop.secondary===4,'Four original puzzle modes must remain available');
 assert(desktop.dock?.bottom<=1000,'Dock pushed too far down: '+JSON.stringify(desktop.dock));
 await page.screenshot({path:'screenshots/v239-home-desktop-1658x928.png',fullPage:true});
 console.log('PASS desktop hero geometry',JSON.stringify(desktop));
 await page.evaluate(()=>document.querySelector('.gtp239-mode-card[data-action="open"]')?.click());
 await page.waitForSelector('#app[data-screen="game"]');
 assert(await page.locator('.gtp233-viewport-art').count()===1,'Original fullscreen game wallpaper regressed');
 await page.evaluate(()=>document.querySelector('button[data-action="home"]')?.click());
 await page.waitForSelector('.gtp239-home');
 await page.evaluate(()=>document.querySelector('.gtp239-mode-card[data-action="home-full"]')?.click());
 await page.waitForSelector('#app[data-screen="game"]');
 assert(await page.locator('#app[data-session="daily"]').count()===1,'Full Scan did not launch Daily');
 await page.evaluate(()=>document.querySelector('button[data-action="home"]')?.click());
 await page.waitForSelector('.gtp239-home');
 await page.setViewportSize({width:390,height:844});
 await page.waitForTimeout(250);
 const mobile=await page.evaluate(()=>({
  viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,
  cards:document.querySelectorAll('.gtp239-mode-card').length,
  stage:document.querySelector('.gtp239-bin-stage')?.getBoundingClientRect().width,
  button:document.querySelector('.gtp239-open-intel')?.getBoundingClientRect().width
 }));
 assert(mobile.scrollWidth<=391,'Horizontal mobile overflow: '+JSON.stringify(mobile));
 assert(mobile.cards===6&&mobile.stage>=325&&mobile.button>=200,'Mobile home incomplete: '+JSON.stringify(mobile));
 await page.screenshot({path:'screenshots/v239-home-mobile-390x844.png',fullPage:true});
 console.log('PASS mobile home',JSON.stringify(mobile));
}finally{await browser?.close();server.kill()}
