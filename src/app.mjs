import {MAPS,LOCATIONS,LEGACY_LOCATIONS,mapShots,mapRound,mapGuess,dailyMap,resolveLocation,sourceForLocation} from './maps.mjs?v=2.6.0';
import {findVerifiedMapImages,dayMapSelection} from './map_runtime.mjs?v=2.6.0';
import {TIPS,unlockedIntel,tipFor} from './tips.mjs?v=2.6.0';
import {legends} from './data.mjs?v=2.6.0';
import {artCatalog} from './art.mjs?v=2.6.0';
import {abilityCandidates,localAbilitySlugs} from './abilities.mjs?v=2.6.0';
import {dailySpotlight,wheelChoices,wheelPick,destinationRotation} from './spotlight.mjs?v=2.6.0';
import {playSound} from './audio.mjs?v=2.6.0';
import {paintPixelScene} from './pixel_scene.mjs?v=2.6.0';
import {loadStore,saveStore} from './store.mjs?v=2.6.0';
import {FIELDS,LABELS,MODES,MODE_NAMES,CLASS_NAMES,MAX_GUESSES,MAX_HINTS,maxGuesses,utcDay,puzzleAnswers,newRound,tryGuess,expireRound,
  getHint,availableHintFields,formatValue,gameScore,gameRank,scannerState,filteredRoster,remainingTime,dayCount,streak,legendByName} from './engine.mjs?v=2.6.0';

const app=document.getElementById('app');
let store=loadStore();
let mapAvailability='checking', verifiedMapPool=[], mapCheckPromise=null;
const dailyModes=()=>mapAvailability==='ready'?MODES:MODES.filter(mode=>mode!=='map');
const mapEntry=()=>dayMapSelection(today(),verifiedMapPool.map(item=>item.entry));
const availableMapEntry=(id)=>verifiedMapPool.some(item=>item.entry.id===id);
async function startMapPreflight(){
 if(mapCheckPromise)return mapCheckPromise;
 // Probe a small cross-map sample before downloading every full-size screenshot.
 const featured=['kc-caustic-exterior','kc-crypto-interior','we-lava','ol-bonsai','sp-barometer','bm-terraformer','ed-city-hall','kc-bunker'];
 const quick=featured.map(id=>LOCATIONS.find(x=>x.id===id)).filter(Boolean);
 const remaining=LOCATIONS.filter(e=>!featured.includes(e.id)&&mapShots(e).length);
 mapCheckPromise=findVerifiedMapImages(quick).then(async items=>items.length?items:findVerifiedMapImages(remaining)).then(items=>{
   verifiedMapPool=items;mapAvailability=items.length?'ready':'offline';
   if(screen==='home'||screen==='records')render({scroll:false});
   return mapAvailability;
 }).catch(()=>{mapAvailability='offline';if(screen==='home')render({scroll:false});return 'offline';});
 return mapCheckPromise;
}

let screen='home';
let session='daily';
let active='classic';
let pickerOpen=false;
let pickerSearch='';
let pickerClass='All';
let pickerSort='az';
let quickSearch='';
let toastTimer=null;
let wheelOpen=false;
let wheelRole="All";
let wheelExcluded=new Set();
let wheelNoRepeat=true;
let wheelAnimation=0;
let wheelAngle=0;
let wheelSpinning=false;
let wheelChosen=null;
let wheelDisplayList=null;
const COLORS={classic:'#aa80f6',pixel:'#5dd9ef',quote:'#ffc88f',ability:'#8de6bf',emoji:'#dca3fe',map:'#91baff'};
const ICONS={classic:'✦',pixel:'▦',quote:'❞',ability:'⌁',emoji:'✧',map:'⌖'};
const TAGLINES={classic:'Deduce the Legend with five clues.',pixel:'Uncover a complete mystery scene with each guess.',quote:'Read the intercepted transmission.',ability:'Identify the real passive icon.',emoji:'Decode three mysterious symbols.',map:'Which map? Which location?'};
const params=new URLSearchParams(location.search);
const paramDay=params.get('day');
let sharedDay=(paramDay&&/^\d{4}-\d{2}-\d{2}$/.test(paramDay)&&!Number.isNaN(Date.parse(paramDay+'T00:00:00Z')))?paramDay:null;
const today=()=>sharedDay||utcDay();
const answers=()=>puzzleAnswers(today(),legends);

const PORTRAIT_FRAME_CLASS='balanced';
let intelModalOpen=false;
let intelFirstRevealPending=false;
let intelAnimation=null;
const styleBadges=round=>{const tags=[];if(round.won&&round.guesses.length<=3&&!round.hints.length)tags.push('FLAWLESS READ');if(round.won&&round.timeLimit&&remainingTime(round,round.finishedAt)>=90)tags.push('SPEED CLEAR');if(round.won&&round.mode==='signal')tags.push('MYSTERY CLEAR');return tags;};
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const classOf=mode=>COLORS[mode]||'#ff91b7';
const sound=name=>playSound(name,store.settings.audio);
const sync=()=>saveStore(store);
const getRound=()=>session==='daily'?store.days[today()]?.[active]:store.practice[active];
function setRound(round){
  if(session==='daily') store.days[today()]={...store.days[today()],[active]:round};
  else store.practice[active]=round;
  sync();
}
function ensureRound(mode=active,playSession=session){
  let round=playSession==='daily'?store.days[today()]?.[mode]:store.practice[mode];
  if(round){
    // A previously created Ability puzzle must never have a missing asset.
    // Only repair unstarted rounds; never silently change a guessed answer.
    if(mode==='ability'&&!round.finished&&!round.guesses?.length){
      const target=legendByName(legends,round.answer);
      if(!target||!localAbilitySlugs.includes(target.slug)){
        round=newRound(answers().ability,round.mode,round.timeLimit);
        if(playSession==='daily')store.days[today()][mode]=round;
        else store.practice[mode]=round;
        sync();
      }
    }
    if(mode==='map'&&!availableMapEntry(round.answer)){
      const candidate=playSession==='daily'?mapEntry():verifiedMapPool[Math.floor(Math.random()*verifiedMapPool.length)]?.entry;
      if(!candidate)return round;
      round=mapRound(candidate);
      if(playSession==='daily')store.days[today()][mode]=round;else store.practice[mode]=round;
      sync();
    }
    if(round.mode==='full'&&!round.finished&&round.guesses?.length>=5){
      round={...round,finished:true,won:false,loss:'attempts',finishedAt:Date.now()};
      if(playSession==='daily')store.days[today()][mode]=round;
      else store.practice[mode]=round;
      sync();
    }
    return round;
  }
  if(mode==='map'){
    const candidate=playSession==='daily'?mapEntry():verifiedMapPool[Math.floor(Math.random()*verifiedMapPool.length)]?.entry;
    if(!candidate)throw Error('Map photos have not been verified');
    round=mapRound(candidate);
    if(playSession==='daily')store.days[today()]={...store.days[today()],[mode]:round};else store.practice[mode]=round;
    sync();return round;
  }
  const eligible=mode==='ability'?legends.filter(l=>localAbilitySlugs.includes(l.slug)):legends;
  const answer=playSession==='daily'?answers()[mode]:eligible[Math.floor(Math.random()*eligible.length)].name;
  round=newRound(answer,store.settings.playStyle,store.settings.rush?180:0);
  if(playSession==='daily')store.days[today()]={...store.days[today()],[mode]:round};
  else store.practice[mode]=round;
  sync();
  return round;
}
function randomPractice(mode=active){
  if(mode==='map'){if(mapAvailability!=='ready'){showToast('MAP IS OFFLINE · NO VERIFIED LOCATION PHOTO');return;}store.practice.map=mapRound(verifiedMapPool[Math.floor(Math.random()*verifiedMapPool.length)].entry);sync();session='unlimited';active=mode;screen='game';pickerOpen=false;render();return;}
  const last=store.practice[mode]?.answer;
  const pool=legends.filter(l=>l.name!==last&&(mode!=='ability'||localAbilitySlugs.includes(l.slug)));
  store.practice[mode]=newRound(pool[Math.floor(Math.random()*pool.length)].name,store.settings.playStyle,store.settings.rush?180:0);
  sync();session='unlimited';active=mode;screen='game';pickerOpen=false;render();sound('nav');
}
function portrait(slug,{alt='',cls='',concealed=false,eager=false}={}) {
  // Images are not embedded in HTML. The loader tries each real-character source.
  return `<span class="portrait-holder ${esc(cls)}"><img data-portrait="${esc(slug)}" alt="${esc(concealed?'Mystery Legend portrait':alt)}" loading="${eager?'eager':'lazy'}" decoding="async"/></span>`;
}
function loadPortraitImages(parent=app){
  parent.querySelectorAll('img[data-portrait]:not([data-art-ready])').forEach(image=>{
    image.dataset.artReady='yes';
    const candidates=artCatalog[image.dataset.portrait]||[];let index=0;
    const next=()=>{
      if(index>=candidates.length){
        const box=image.closest('.portrait-holder');
        const px=box?.closest('.pixel-art');
        if(px){const status=px.querySelector('.pixel-error');if(status)status.textContent='IMAGE SOURCE UNAVAILABLE · USE BACKUP INTEL';}
        if(box){const name=image.dataset.portrait||'?';const initial=(name[0]||'?').toUpperCase();box.innerHTML='<span class="portrait-unavailable" aria-label="Image unavailable"><b>'+initial+'</b><small>VISUAL SIGNAL<br>UNAVAILABLE</small></span>';}
        return;
      }
      image.src=candidates[index++];
    };
    image.addEventListener('error',next);
    image.addEventListener('load',()=>{
      if(image.naturalWidth<80||image.naturalHeight<80){next();return;}
      if(image.dataset.portrait==='mirage')image.closest('.hero-stage')?.classList.add('art-loaded');
      const pixels=image.closest('.pixel-art');
      if(pixels){
        const canvas=pixels.querySelector('canvas.pixel-canvas');
        if(canvas)paintPixel(canvas,image);
      }
    });
    next();
  });
}
function paintPixel(canvas,image){
  const result=paintPixelScene(canvas,image,{resolution:Number(canvas.dataset.resolution)||28,seed:image.dataset.portrait||'legend'});
  canvas.classList.toggle('loaded',result);
}

function loadAbilityImages(parent=app){
  parent.querySelectorAll('img[data-ability]:not([data-ability-ready])').forEach(img=>{
    img.dataset.abilityReady='1';
    const sources=abilityCandidates(img.dataset.ability);
    const box=img.closest('.ability-symbol');
    let ix=0;
    const next=()=>{
      if(!img.isConnected)return;
      if(ix>=sources.length){
        img.hidden=true;
        if(box)box.classList.add('ability-offline');
        return;
      }
      img.src=sources[ix++];
    };
    img.addEventListener('load',()=>{
      if(img.naturalWidth<24||img.naturalHeight<24){next();return;}
      if(box)box.classList.add('ability-loaded');
    });
    img.addEventListener('error',next);
    next();
  });
}
function loadMapImages(parent=app){
  parent.querySelectorAll('img[data-map-photo]:not([data-media-ready])').forEach(img=>{
    img.dataset.mediaReady='1';
    const entry=LOCATIONS.find(loc=>loc.id===img.dataset.mapPhoto);
    if(!entry)return;
    const frame=img.closest('.map-photo');
    const certified=verifiedMapPool.find(item=>item.entry.id===entry.id);
    const sources=certified?[certified.url]:[];
    let nextIndex=0;
    const next=()=>{
      if(!img.isConnected)return;
      frame?.classList.remove('has-map-art');
      if(nextIndex>=sources.length){frame?.classList.add('map-unavailable');
        document.querySelectorAll('.map-choice').forEach(button=>button.disabled=true);
        showToast('MAP IMAGE COULD NOT LOAD. ROUND PAUSED · GO BACK TO MODES.');return;}
      // The first candidate is a real file that can be placed in the repository.
      img.src=sources[nextIndex++];
    };
    img.addEventListener('load',()=>{
      if(img.naturalWidth<180||img.naturalHeight<100){next();return;}
      frame?.classList.add('has-map-art');
      frame?.classList.remove('recon-art');
      frame?.classList.toggle('external-reference',img.currentSrc.startsWith('https://'));
    });
    img.addEventListener('error',next);
    next();
  });
}
function edgeArenaDecor(){
  return `<aside class="edge-arena edge-arena-left" aria-hidden="true"><div class="edge-stitch"></div><span class="edge-glyph">△</span><span class="edge-label">OUTLANDS<br>AFTER HOURS</span><span class="edge-spark">✦ ✧</span></aside><aside class="edge-arena edge-arena-right" aria-hidden="true"><div class="edge-stitch"></div><span class="edge-glyph">◈</span><span class="edge-label">MIRAGE'S<br>HAUNTED ARENA</span><span class="edge-spark">✧ ✦</span></aside>`;
}
// The character is painted only once inside the backdrop art. No artificial gaze overlay.
function nav(){return `<header class="top gtp2-top"><div class="gtp2-top-inner">
  <button class="brand gtp2-brand" data-action="home" aria-label="Guess the Predator 2 home"><span class="brand-icon" aria-hidden="true"><span class="brand-apex">G</span></span><span class="brand-text"><strong>GUESS THE <em>PREDATOR</em> <sup>2</sup></strong><small>NOVA · V2.6</small></span></button>
  <nav class="topnav" aria-label="Main navigation"><button class="nav-item ${screen==='home'?'active':''}" data-action="home">⌂ HOME</button><button class="nav-item ${screen==='game'?'active':''}" data-action="open" data-mode="classic">◈ PLAY</button><button class="nav-item ${screen==='records'?'active':''}" data-action="records">▤ STATS</button><button class="nav-item" data-action="open" data-mode="map" ${mapAvailability!=='ready'?'disabled title="Map unlocks only when a real screenshot loads"':''}>⌖ MAP HUNT</button></nav>
  <div class="top-actions"><button class="switch gtp2-sound-switch" data-action="audio" aria-label="Toggle original sound effects" aria-pressed="${store.settings.audio}">${store.settings.audio?'♫ SOUND ON':'♪ SOUND OFF'}</button><button class="gtp2-audio-preview" data-action="sound-test" title="Preview original UI sound">♪ PREVIEW FX</button></div>
 </div></header>`;}
function statCards(){
  const day=store.days[today()]||{};const stats=streak(store.days,utcDay(),dailyModes());
  return `<section class="dash" aria-label="Player statistics">
    <div class="stat"><label>DAILY SIGNALS</label><strong>${dayCount(day,dailyModes())}<small> / ${dailyModes().length}</small></strong><small>Playable puzzles</small></div>
    <div class="stat"><label>CURRENT STREAK</label><strong>${stats.current}</strong><small>Full Daily clears</small></div>
    <div class="stat"><label>PERSONAL BEST</label><strong>${store.history.bestScore||0}</strong><small>Highest round score</small></div>
    <div class="stat"><label>TOTAL WINS</label><strong>${store.history.wins||0}</strong><small>Across both sessions</small></div>
  </section>`;
}
function forbiddenPanel(){
  const spot=dailySpotlight(utcDay(),legends);
  const finished=store.days[today()]||{};
  const completed=dailyModes().filter(m=>finished[m]?.finished).length;
  const total=dailyModes().length;
  const unlocked=unlockedIntel(finished,dailyModes());
  const claimed=!!store.intelOpenedDays?.[today()];
  return `<section class="vault-showcase" aria-label="Forbidden Apex Tip">
    <div class="vault-intro"><span class="kicker">✦ REWARD TRANSMISSION</span><h2>FORBIDDEN <em>INTEL.</em></h2><p>A daily reward for every player who completes the available missions. Wins AND losses count.</p>
      <div class="vault-track"><span style="width:${completed/total*100}%"></span></div><strong>${completed}/${total} MISSIONS COMPLETED</strong>
      <button class="btn vault-activate" data-action="intel-open" ${unlocked?'':'disabled'}>${unlocked?(claimed?"✦ VIEW TODAY'S TIP":'✦ OPEN THE MYSTERY CHEST'):'◆ COMPLETE THE DAILY TO UNLOCK'}</button>
    </div>
    <div class="vault-display ${unlocked?'ready':''}" aria-hidden="true"><div class="vault-aurora"></div><div class="vault-sparkle sp1">✧</div><div class="vault-sparkle sp2">✦</div><div class="vault-chest"><div class="vault-lid"><span>◆</span></div><div class="vault-box"><span>✦</span></div></div><span class="vault-caption">${unlocked?'CHEST READY // CLICK TO CLAIM':'CLASSIFIED // ENCRYPTED'}</span></div>
  </section>`;
}
function intelDialog(){
  const spot=dailySpotlight(utcDay(),legends);
  const dialog=document.createElement('div');dialog.className='intel-backdrop';dialog.id='intel-dialog';dialog.setAttribute('role','presentation');
  dialog.innerHTML=`<div class="intel-modal" role="dialog" aria-modal="true" aria-label="Forbidden Intel reward"><button class="intel-close" data-action="intel-close" type="button" aria-label="Close reward">✕</button>
      <div class="intel-reveal-scene"><span class="reward-spark s1">✦</span><span class="reward-spark s2">✧</span><span class="reward-spark s3">✦</span><span class="reward-spark s4">✧</span>
      <div class="reward-chest"><div class="reward-lid">◆</div><div class="reward-base">✦</div></div>
      <div class="gold-paper"><div class="paper-stamp">✦ OUTLANDS / DAILY REWARD ✦</div><h2>TIP OF<br>THE DAY</h2><span class="paper-legend">${esc(spot.name.toUpperCase())} · ${esc(spot.role.toUpperCase())}</span><p>${esc(tipFor(spot))}</p><small>INTEL DECLASSIFIED · ${esc(today())}</small></div>
      <span class="reveal-boozle">BAMBOOZLED! ✦</span></div><div class="intel-dialog-footer"><button class="btn mint" data-action="intel-close" type="button">TAKE THE INTEL ✓</button></div></div>`;
  dialog.addEventListener('click',ev=>{if(ev.target===dialog)closeIntelDialog();});
  app.appendChild(dialog);intelModalOpen=true;
  const close=dialog.querySelector('.intel-close');close?.focus({preventScroll:true});
  if(!intelFirstRevealPending){
    dialog.querySelector('.intel-modal')?.classList.add('reveal-started','reveal-finished');
  }else{ replayIntelReveal(); }
  intelFirstRevealPending=false;
}
function replayIntelReveal(){
  const modal=document.querySelector('.intel-modal');if(!modal)return;
  modal.classList.remove('reveal-started','reveal-finished');void modal.offsetWidth;
  modal.classList.add('reveal-started');sound('reveal');
  clearTimeout(intelAnimation);
  intelAnimation=setTimeout(()=>{if(modal.isConnected)modal.classList.add('reveal-finished');},2500);
}
function closeIntelDialog(){
  clearTimeout(intelAnimation);document.getElementById('intel-dialog')?.remove();intelModalOpen=false;
}
function dailyExtras(){
  const legend=dailySpotlight(utcDay(),legends);
  return `<section class="daily-extras" aria-label="Daily Legend and random Legend picker">
    <article class="daily-spotlight"><div class="spotlight-portrait">${portrait(legend.slug,{alt:legend.name,cls:'balanced'})}<span class="spotlight-corner">✦</span></div><div class="spotlight-copy"><span class="kicker">✳ LEGEND OF THE DAY</span><h3>${esc(legend.name)}</h3><p class="spotlight-role">${esc(legend.role)} · ${esc(legend.signature)}</p><p>Today's pick for your next match — changes every day, without spoiling today's puzzles.</p><span class="spotlight-reset">◷ REFRESHES AT 00:00 UTC</span></div></article>
    <article class="wheel-teaser"><div class="teaser-bubbles"><span>W</span><span>✦</span><span>28</span></div><div class="wheel-teaser-copy"><span class="kicker">FREE PLAY / OUTLANDS PICKER</span><h3>SPIN THE <em>WHEEL.</em></h3><p>28 Legends. One random pick. Zero excuses.</p><button class="btn dark" data-action="wheel" type="button">🎡 SPIN A LEGEND ↗</button></div></article>
  </section>`;
}
function modeTile(mode,i){
 const round=store.days[today()]?.[mode];
 const status=mode==='map'&&mapAvailability!=='ready'?(mapAvailability==='checking'?'CHECKING REAL IMAGES…':'OFFLINE · REAL IMAGES REQUIRED'):session==='daily'&&round?.finished?(round.won?'✓ CLEARED':'✓ COMPLETED'):'PLAY NOW ↗';
 return `<button class="arena-mode gtp2-mode-card gtp2-card-${mode} ${round?.finished&&session==='daily'?'finished':''}" data-action="open" data-mode="${mode}" ${mode==='map'&&mapAvailability!=='ready'?'disabled aria-disabled="true"':''} style="--tile:${classOf(mode)}" aria-label="Play ${MODE_NAMES[mode]}">
   <span class="gtp2-mode-number">0${i+1}</span><span class="gtp2-mode-glyph" aria-hidden="true">${ICONS[mode]}</span>
   <span class="gtp2-mode-copy"><strong>${MODE_NAMES[mode]}</strong><small>${TAGLINES[mode]}</small><em>${status}</em></span><span class="gtp2-mode-arrow">❯</span>
 </button>`;
}
function home(){
 const unfinished=dailyModes().filter(mode=>!store.days[today()]?.[mode]?.finished);
 const done=dailyModes().length-unfinished.length;
 return `<main class="gtp2-home">
  <section class="gtp2-hero" aria-label="Guess the Predator 2 — six game modes">
   <img id="gtp2-backdrop" class="gtp2-backdrop" src="./assets/decor/haunted-hero.webp" alt="" aria-hidden="true" fetchpriority="high" />
   <div class="gtp2-vignette" aria-hidden="true"></div>
   <div class="gtp2-hero-content">
    <div class="gtp2-heading"><div><span class="gtp2-kicker">✦ PINK MIRAGE / LIGHTSHIFT</span><h1>GUESS THE <span>PREDATOR.</span></h1><p>Find the legend. Crack the location. Rule the daily hunt.</p></div><div class="gtp2-progress"><small>DAILY PROGRESS · ${esc(today())}</small><strong>${done}<em>/${dailyModes().length}</em></strong><span>${done===dailyModes().length?'ALL CHALLENGES COMPLETED':'MISSIONS COMPLETED'}</span></div></div>
    <div class="gtp2-switchline"><div class="gtp2-session" role="group" aria-label="Daily or Free Play"><button data-action="session" data-session="daily" class="${session==='daily'?'active':''}" aria-pressed="${session==='daily'}">◈ DAILY</button><button data-action="session" data-session="unlimited" class="${session==='unlimited'?'active':''}" aria-pressed="${session==='unlimited'}">∞ FREE PLAY</button></div><span>SELECT YOUR CHALLENGE ✦</span></div>
    <div class="gtp2-mode-layout"><div class="gtp2-mode-column">${MODES.slice(0,3).map((mode,i)=>modeTile(mode,i)).join('')}</div><div class="gtp2-hero-space" aria-hidden="true"></div><div class="gtp2-mode-column">${MODES.slice(3).map((mode,i)=>modeTile(mode,i+3)).join('')}</div></div>
    <div class="gtp2-hero-footer"><span>${session==='daily'?'DAILY MISSIONS · ONE ROUND EACH':'UNLIMITED PRACTICE · NO STREAK RISK'}</span>${session==='daily'?`<button data-action="home-daily" class="gtp2-primary">${unfinished.length?'CONTINUE DAILY':'VIEW RESULTS'} <b>↗</b></button>`:`<button data-action="open" data-mode="classic" class="gtp2-primary">START FREE PLAY <b>↗</b></button>`}<span>${mapAvailability==='ready'?'MAP ONLINE · VERIFIED SCREENSHOTS':mapAvailability==='checking'?'MAP: CHECKING SOURCE IMAGES':'MAP OFFLINE · NO FAKE SCREENSHOTS'}</span></div>
   </div>
  </section>
  <div class="gtp2-bottom"><div class="gtp2-side-label"><span>BEYOND THE ARENA</span><small>CHOOSE · COLLECT · DISCOVER</small></div>
  ${dailyExtras()}${forbiddenPanel()}${statCards()}
  <footer class="gtp2-disclaimer">This independent trivia project is not endorsed by or affiliated with EA or its licensors. Character names and gameplay references belong to their respective owners. No extracted game audio is supplied. · <a href="./SOURCES_AND_RIGHTS.md" target="_blank" rel="noopener">SOURCE &amp; RIGHTS NOTES</a></footer></div>
 </main>`;
}
function getVisual(round,target){
  const mode=active;
  if(mode==='pixel'){
    const effect=['mosaic','holo','soft'].includes(store.settings.pixelStyle)?store.settings.pixelStyle:'mosaic';
    const step=Math.min(round.guesses.length,6);
    // Pixelate and blur the FULL COMPOSITE SCENE (location, lights, character), not a lone cutout.
    const sizes=[24,36,55,86,145,260,900];
    const blur=effect==='soft'?[18,14,10,7,4,1.5,0]:effect==='holo'?[5,4,3,2,1,0,0]:[4,3,2,1,0.4,0,0];
    const pct=[12,28,43,59,74,90,100];
    const size=effect==='soft'?900:sizes[step];
    return `<div class="clue-visual visual-pixel px-effect-${effect} nova-pixel-scene"><div class="pixel-art" style="--px-blur:${blur[step]}px;--px-progress:${pct[step]}%">
      <canvas class="pixel-canvas" data-resolution="${size}" width="${size}" height="${size}" aria-label="Progressively decrypted full scene featuring a Legend"></canvas>
      ${portrait(target.slug,{alt:'',cls:'pixel-source',concealed:!round.finished,eager:true})}
      <div class="pixel-fallback" role="group" aria-label="Offline character identity clues"><span class="pixel-fallback-kicker">◈ BACKUP INTEL / SIGNAL RECOVERY</span><div class="pixel-fallback-emblem">${esc((target.emoji.split(/\s+/)[0]||'◇'))}</div><strong>${step>=1?esc(target.role.toUpperCase()):'CLASSIFIED ROLE'}</strong><p>${step>=3?esc(target.title):'IDENTITY PROFILE ENCRYPTED'}</p><small>${step>=5?esc(target.signature):'ADDITIONAL INTEL UNLOCKS AFTER GUESSES'}</small></div><div class="pixel-error" aria-hidden="true"></div><div class="pixel-scratch scratch-a"></div><div class="pixel-scratch scratch-b"></div><div class="pixel-scan"></div><div class="pixel-vignette"></div>
      </div><div class="pixel-dots"></div><div class="pixel-caption">DECRYPTION ${pct[step]}% · ${maxGuesses(round)-round.guesses.length} MOVES LEFT</div><div class="pixel-preset" role="group" aria-label="Choose pixel reveal effect">${[['mosaic','▦ MOSAIC'],['soft','◌ SOFT BLUR'],['holo','⌁ SIGNAL']].map(([value,label])=>`<button class="${effect===value?'active':''}" type="button" data-action="pixel-style" data-style="${value}" aria-pressed="${effect===value}">${label}</button>`).join('')}</div></div>`;
  }
  if(mode==='quote')return `<div class="clue-visual gtp2-quote-rework"><div class="gtp2-quote-lines" aria-hidden="true"></div><div class="gtp2-quote-head"><span>◈ ORIGINAL QUOTE / NO VOICE IMPERSONATION</span><span>CHANNEL 0${MODES.indexOf(active)+1}</span></div><div class="gtp2-quote-mark" aria-hidden="true">“</div><blockquote>“${esc(target.quote)}”</blockquote><div class="gtp2-quote-status"><span class="gtp2-live-dot"></span> ENCRYPTED SIGNAL · IDENTIFY THE SPEAKER</div></div>`;
  if(mode==='ability')return `<div class="clue-visual visual-ability"><div class="ability-stage" aria-label="Recognize the Apex ability icon"><div class="ability-outer-orbit"></div><div class="ability-symbol" role="img" aria-label="Unidentified in-game passive ability icon"><img data-ability="${esc(target.slug)}" alt="" loading="eager"/><span class="ability-wait">LOADING ABILITY<br>ICON…</span><span class="ability-fail">ABILITY ICON<br>UNAVAILABLE</span></div><span class="ability-tag">PASSIVE // IMAGE ONLY</span></div></div>`;
  if(mode==='emoji'){
    const all=[...target.emoji.split(/\s+/),...target.extraEmoji];
    const shown=Math.min(all.length,2+Math.floor(round.guesses.length/2));
    return `<div class="clue-visual visual-emoji">${all.map((symbol,i)=>`<span class="emoji-token ${i>=shown?'locked':''}">${i<shown?esc(symbol):'?'}</span>`).join('')}</div>`;
  }
  return `<div class="clue-visual"><div class="classified-mark"><small>IDENTITY / 00</small><strong>LEGEND<br>UNKNOWN</strong><small>THE SCANNER KNOWS MORE</small></div></div>`;
}
function modeRail(){return `<nav class="mode-rail" aria-label="Switch game mode">${MODES.map(mode=>`<button class="mode-tab ${active===mode?'active':''} ${session==='daily'&&store.days[today()]?.[mode]?.won?'done':''}" style="--tile:${classOf(mode)}" data-action="open" data-mode="${mode}" ${mode==='map'&&mapAvailability!=='ready'?'disabled title="Requires verified real location images"':''}><b>${ICONS[mode]}</b><span>${MODE_NAMES[mode]}</span></button>`).join('')}</nav>`;}
function styleStrip(round){
  const locked=round.guesses.length>0||round.finished;
  return `<div class="style-strip" aria-label="Round rules">
    <div><strong>HOW MUCH INTEL PER GUESS?</strong><div class="style-description">${round.mode==='signal'?'MYSTERY: a random honest green or red comparison':'CLASSIC: reveal all five comparisons'}</div></div>
    <div class="style-options" role="group" aria-label="Choose feedback"><button class="segment ${round.mode==='signal'?'active':''}" data-action="style" data-style="signal" ${locked?'disabled':''}>✦ ONE SIGNAL</button><button class="segment ${round.mode==='full'?'active':''}" data-action="style" data-style="full" ${locked?'disabled':''}>▦ FULL SCAN</button><button class="segment rush-btn ${round.timeLimit?'active':''}" data-action="rush" ${locked?'disabled':''}>⌛ RUSH ${round.timeLimit?'180s':'OFF'}</button></div>
  </div>`;
}
function latestSignal(round,target){
  if(!round.guesses.length)return `<div class="flash idle"><span class="signal-mark">✧</span><span><strong>AWAITING YOUR FIRST GUESS</strong><small>Your next guess will reveal ${round.mode==='signal'?'one of the five traits':'all five traits'}.</small></span></div>`;
  if(round.mode==='full')return `<div class="flash idle"><span class="signal-mark">▦</span><span><strong>FULL SCAN RECEIVED</strong><small>Compare all five fields below. Matches stay green.</small></span></div>`;
  const s=round.signals.at(-1);
  if(!s)return `<div class="flash idle"><span class="signal-mark">⌁</span><span><strong>NO NEW SIGNAL</strong><small>All remaining comparable fields were already revealed.</small></span></div>`;
  const correct=s.kind==='correct';
  return `<div class="flash ${correct?'good':'bad'}" role="status"><span class="signal-mark">${correct?'✓':'×'}</span><span><strong>${esc(s.guess)} · ${LABELS[s.field]} ${correct?'MATCH':'MISMATCH'}${s.direction?s.direction>0?' ↑':' ↓':''}</strong><small>${esc(s.value)} ${s.direction?(s.direction>0?'· Target is higher/newer':'· Target is lower/older'):correct?'· Locked green':'· Keep investigating'}</small></span></div>`;
}
function scannerMarkup(round,target){
  const scanner=scannerState(round,target,legends);
  const lastField=round.signals.at(-1)?.field;
  const cells=FIELDS.map(field=>{
    const signal=scanner[field];const kind=signal.kind;
    const css=kind==='correct'?'good':kind==='wrong'?'bad':kind==='hint'?'hinted':kind==='unknown'?'unknown':'';
    const direction=signal.direction>0?'↑':signal.direction<0?'↓':'';
    return `<div class="scan-cell ${css} ${field===lastField?'new':''}" title="${LABELS[field]}" aria-label="${LABELS[field]} ${kind}"><small>${LABELS[field]}</small><strong>${esc(signal.value)}${direction?' '+direction:''}</strong><span>${kind==='correct'?'✓ MATCH':kind==='wrong'?'× MISS':kind==='hint'?'✧ HINT':kind==='unknown'?'N/A':'—'}</span></div>`;
  }).join('');
  const remaining=availableHintFields(round,target,legends);
  const disabled=round.finished||round.guesses.length===0||round.hints.length>=MAX_HINTS||remaining.length===0;
  return `<div class="scanner-head"><strong>◈ IDENTITY SIGNAL BOARD</strong><small>GREEN IS LOCKED · RED IS A CLUE</small></div>
  <div class="scanner" role="group" aria-label="Legend scanner">${cells}</div>
  <div class="hint-row"><button class="btn lilac small" data-action="hint" ${disabled?'disabled':''}>✧ SMART HINT · ${MAX_HINTS-round.hints.length} LEFT</button><small>Never repeats confirmed intel</small></div>`;
}
function guessBody(round,target){
  if(round.finished){
    const score=gameScore(round);const rank=gameRank(score);const badges=styleBadges(round);
    return `<div class="end-panel"><span class="rank">${round.won?rank:'—'}</span><h2>${round.won?'TARGET FOUND!':round.loss==='time'?'TIME’S UP.':'NICE TRY.'}</h2><p>${round.won?`You identified ${esc(target.name)} in ${round.guesses.length} guesses. ${score} points earned.`:`Your mystery Legend was ${esc(target.name)}. Every guess counts. Try another round!`}</p>${badges.length?`<div class="medal-row">${badges.map(tag=>`<span class="medal">${esc(tag)}</span>`).join('')}</div>`:''}<div class="answer-tag">${portrait(target.slug,{alt:target.name,cls:'balanced'})}<strong>${esc(target.name)}</strong></div>
      <div class="end-actions"><button class="btn pink" data-action="next">${session==='daily'?'NEXT CHALLENGE':'TRY AGAIN'} ↗</button><button class="btn lilac" data-action="again">∞ FREE PLAY</button><button class="btn ghost" data-action="home">ALL MODES</button></div></div>`;
  }
  return `<div class="guess-top"><div><small>YOUR NEXT MOVE</small><h2>WHO’S THAT <span style="color:#ef4895">LEGEND?</span></h2></div><span class="pill">${round.guesses.length}/${maxGuesses(round)} GUESSES · ${maxGuesses(round)-round.guesses.length} LEFT</span></div>
  <div class="search-wrap"><input id="guess-search" autocomplete="off" aria-label="Search a Legend" placeholder="Type a Legend name…" value="${esc(quickSearch)}"/><button class="btn pink small" data-action="submit-search" title="Guess first matching Legend">↗</button><div id="search-results" class="search-list" style="display:none"></div></div>
  <div class="guess-tools"><button class="btn mint small" data-action="picker">◫ BROWSE LEGENDS</button><small>Filter by class · Guess faster · Press G</small></div>
  ${latestSignal(round,target)}${scannerMarkup(round,target)}
  <div class="tried-list" aria-label="Eliminated guesses">${round.guesses.length?round.guesses.map(name=>`<span class="used">${esc(name)}</span>`).join(''):'<span style="color:#875d91;font-size:10px;font-weight:800">No Legends eliminated yet · open Browse for faster reads</span>'}</div>`;
}
function mapGame(){
 const round=ensureRound(),entry=resolveLocation(round.answer)||LOCATIONS[0];
 const stage=round.stage;
 const choices=stage===1?MAPS:(entry.legacy?LEGACY_LOCATIONS:LOCATIONS).filter(x=>x.map===entry.map).map(x=>x.poi);
 const attempted=stage===1?round.mapGuesses:round.poiGuesses;
 const used=new Set(attempted);
 const options=choices.map(choice=>`<button class="map-choice ${used.has(choice)?'eliminated':''}" data-action="map-guess" data-name="${esc(choice)}" ${round.finished||used.has(choice)?'disabled':''}>${esc(choice)}${used.has(choice)?' ×':''}</button>`).join('');
 const state=round.finished?(round.won?'✓ SECTOR CONFIRMED':'✕ SIGNAL LOST'):`STAGE ${stage} / 2 · ${stage===1?'IDENTIFY MAP':'IDENTIFY POI'}`;
 const img=`<img class="map-img-candidate" data-map-photo="${esc(entry.id)}" data-map-angle="${Number(round.mediaAngle)||0}" alt="Real screenshot of an Apex location, source verified to load before round" loading="eager" decoding="async" />`;
 return `<main class="wrap game map-game gtp2-game-scene gtp2-scene-map"><div class="game-topline"><button class="tiny-link" data-action="home">← BACK TO MODES</button><span class="pill">${session==='daily'?'DAILY':'FREE PLAY'} / MAP RECON</span></div>
 <div class="game-titlebar"><div><span class="kicker">OUTLANDS CARTOGRAPHY / 06</span><h1>GUESS THE MAP<span style="color:#ff6ebf">.</span></h1><p>Identify the POI using a loaded screenshot from a documented external source.</p></div><span class="game-attempts">${round.finished?'DONE':stage===1?3-attempted.length:2-attempted.length}<small> LEFT</small></span></div>
 ${modeRail()}<section class="map-challenge"><div class="map-frame"><div class="panel-top"><span>⌖ UNKNOWN LOCATION / TRANSMISSION</span><small>${state}</small></div><div class="map-photo">${img}<div class="map-offline"><b>REAL IMAGE UNAVAILABLE</b><p>The round is paused until its source works. No unrelated artwork is substituted.</p><span>${esc(entry.clue)}</span></div></div><div class="map-credit"><span class="recon-credit">MAP INTEL · VERIFIED SOURCE</span><span class="capture-credit">EXTERNAL SCREENSHOT · FAN PROTOTYPE</span><a class="map-source-link" href="${esc(sourceForLocation(entry))}" target="_blank" rel="noopener noreferrer">VIEW SOURCE ↗</a></div></div>
 <div class="map-terminal"><span class="kicker">${round.finished?'MISSION REPORT':state}</span><h2>${round.finished?(round.won?'TARGET LOCATED!':'TRY ANOTHER SECTOR'):(stage===1?'WHICH MAP?':'WHICH POI?')}</h2><p>${round.finished?`Answer: ${esc(entry.map)} / ${esc(entry.poi)}.`:stage===1?'You have three map attempts. Each wrong map is eliminated.':'Map confirmed. Find the exact location in two attempts.'}</p><div class="map-structural-intel"><small>⌖ LANDMARK READOUT</small><p>${esc(entry.clue)}</p></div>
 <div class="map-choices">${round.finished?'':options}</div>${round.finished?`<div class="end-actions"><button class="btn pink" data-action="next">NEXT CHALLENGE ↗</button><button class="btn mint" data-action="again">∞ FREE PLAY</button></div>`:''}
 ${attempted.length?`<div class="map-trail">Eliminated: ${attempted.filter(n=>n!==(stage===1?entry.map:entry.poi)).map(esc).join(', ')||'None'}</div>`:''}</div></section></main>`;
}
function game(){
  if(active==='map'&&mapAvailability==='ready')return mapGame();
  if(active==='map'){screen='home';return home();}
  const round=ensureRound();const target=legendByName(legends,round.answer);
  const timeLeft=remainingTime(round);const urgent=timeLeft!=null&&timeLeft<=25&&!round.finished;
  return `<main class="wrap game gtp2-game-scene gtp2-scene-${active}" style="--tile:${classOf(active)}"><div class="game-topline"><button class="tiny-link" data-action="home">← BACK TO MODES</button><span class="pill">${sharedDay?'◇ SHARED DAILY · '+today():session==='daily'?'◉ DAILY / '+today():'∞ FREE PLAY'}</span></div>
  <div class="game-titlebar"><div><span class="kicker">SIGNAL FILE / 0${MODES.indexOf(active)+1}</span><h1>${MODE_NAMES[active]}<span style="color:#e94499">.</span></h1><p>${TAGLINES[active]}</p></div>
  <div class="game-status">${round.timeLimit?`<div id="round-timer" class="game-timer ${urgent?'urgent':''}" aria-label="Time remaining"><i>◷</i><span>${timeLeft??180}s</span></div>`:''}<span class="game-attempts">${maxGuesses(round)-round.guesses.length}<small> LEFT</small></span></div></div>
  ${modeRail()}${styleStrip(round)}
  <div class="game-layout"><section class="clue-card" aria-label="Challenge clue"><div class="panel-top"><span>✧ TRANSMISSION / ${MODE_NAMES[active]}</span><small>IDENTITY HIDDEN</small></div>${getVisual(round,target)}<div class="clue-foot"><span>✧ ${active==='quote'?'ORIGINAL FAN CLUE':active==='pixel'?'PIXEL SCRAMBLER':'FIVE-TRAIT MYSTERY'}</span><span>${round.finished?'FILE DECLASSIFIED':'NO SPOILERS'}</span></div></section>
  <section class="guess-card" aria-label="Guess the Legend"><div class="panel-top"><span>⌁ GUESS TERMINAL</span><small>${round.mode==='signal'?'ONE-SIGNAL INTEL':'FULL CLASSIC INTEL'}</small></div><div class="guess-body">${guessBody(round,target)}</div></section></div>
  ${round.signals.length?`<section class="game-bottom"><div class="bottom-card"><h3>SIGNAL HISTORY</h3><div class="signal-log">${round.signals.slice(-8).map((s,i)=>`<span class="log-item ${s.kind==='correct'?'match':'mismatch'}">${i+1}. ${esc(s.guess)} · ${LABELS[s.field]} ${s.kind==='correct'?'✓':'×'}</span>`).join('')}</div></div></section>`:''}</main>`;
}
function records(){
  const stats=streak(store.days,utcDay(),dailyModes());const days=Object.keys(store.days).sort().reverse().slice(0,14);
  return `<main class="wrap records"><span class="pill">PERSONAL ARCHIVE</span><h1>YOUR <span style="color:#ec4a95">SIGNAL.</span></h1><p class="lead">Records are stored in your browser. No account or public leaderboard required.</p>${statCards()}${forbiddenPanel()}<h2 class="caps" style="font-size:38px">RECENT DAYS</h2><div class="record-rows">${days.map(day=>`<div class="record-row"><span>${day}</span><span>${dayCount(store.days[day],dailyModes())}/${dailyModes().length} ${dayCount(store.days[day],dailyModes())===dailyModes().length?'✦ CLEARED':''}</span></div>`).join('')||'<p>No Daily results yet. Go start a hunt!</p>'}</div><div class="record-settings"><div><strong>ACCESSIBILITY / VISUAL EFFECTS</strong><small>Reduce background and reward animation intensity on slower devices.</small></div><button class="btn lilac small" data-action="motion">FX ${store.settings.motion?'ON':'OFF'} · CHANGE</button></div><button class="btn pink" data-action="home">BACK TO CHALLENGES ↗</button></main>`;
}
function wheelPool(){
 return wheelChoices(legends).filter(l=>(wheelRole==='All'||l.role===wheelRole)&&!wheelExcluded.has(l.name)&&(!wheelNoRepeat||!wheelChosen||l.name!==wheelChosen.name));
}
function refreshWheelOptions(){
 const grid=document.getElementById('wheel-roster-names');if(grid){grid.innerHTML=wheelChoices(legends).map(l=>`<label class="wheel-check"><input type="checkbox" data-wheel-exclude="${esc(l.name)}" ${wheelExcluded.has(l.name)?'checked':''}/> ${esc(l.name)}</label>`).join('');}
 const count=document.getElementById('wheel-available-count');if(count)count.textContent=wheelPool().length+' AVAILABLE';
 const btn=document.getElementById('wheel-spin');if(btn)btn.disabled=wheelPool().length===0||wheelSpinning;
 drawWheel();
}
function drawWheel(angle=wheelAngle){
  const canvas=document.getElementById('legend-wheel');if(!canvas)return;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const logical=600,dpr=Math.min(window.devicePixelRatio||1,2);
  if(canvas.width!==Math.round(logical*dpr))canvas.width=Math.round(logical*dpr);
  if(canvas.height!==Math.round(logical*dpr))canvas.height=Math.round(logical*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,logical,logical);
  const list=wheelDisplayList??wheelPool(),length=list.length,slice=Math.PI*2/Math.max(length,1);
  if(!length){ctx.fillStyle="#382441";ctx.fillRect(0,0,600,600);return;}
  const palette=['#ff89c5','#be9bff','#95ebd2','#ffe0a0','#ffc0a7','#98d8ff','#f6b9ec'];
  ctx.save();ctx.translate(300,300);ctx.rotate(angle);
  for(let i=0;i<length;i++){
    const start=-Math.PI/2-slice/2+i*slice;
    ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,284,start,start+slice);ctx.closePath();
    ctx.fillStyle=palette[i%palette.length];ctx.fill();
    ctx.strokeStyle='#301639';ctx.lineWidth=1.5;ctx.stroke();
    ctx.save();ctx.rotate(start+slice/2);
    ctx.font='800 13px "Arial Narrow", Arial, sans-serif';
    ctx.fillStyle='#281437';ctx.textAlign='right';ctx.textBaseline='middle';
    ctx.fillText(list[i].name.toUpperCase(),270,0,150);
    ctx.restore();
  }
  ctx.beginPath();ctx.arc(0,0,284,0,Math.PI*2);ctx.lineWidth=10;ctx.strokeStyle='#2b173d';ctx.stroke();
  ctx.beginPath();ctx.arc(0,0,67,0,Math.PI*2);ctx.fillStyle='#fff7fc';ctx.fill();ctx.lineWidth=7;ctx.strokeStyle='#31193f';ctx.stroke();
  ctx.fillStyle='#e846a0';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='900 50px Impact, sans-serif';ctx.fillText('G',0,0);
  ctx.restore();
}
function showWheel(){
  if(wheelOpen)return;
  wheelOpen=true;wheelAngle=0;wheelSpinning=false;wheelChosen=null;wheelDisplayList=null;
  const overlay=document.createElement('div');overlay.className='wheel-backdrop';overlay.id='wheel-backdrop';
  overlay.innerHTML=`<section class="wheel-modal" role="dialog" aria-modal="true" aria-label="Spin the Legend wheel">
    <header class="wheel-heading"><div><span class="kicker">CHOOSE YOUR NEXT LEGEND</span><h2>THE <em>OUTLANDS WHEEL.</em></h2><p>Every playable Legend has an equal chance. Your Daily puzzles are unaffected.</p></div><button class="btn flat small" data-action="close-wheel" aria-label="Close wheel">✕ CLOSE</button></header>
    <div class="wheel-layout"><div class="wheel-disc"><span class="wheel-arrow" aria-hidden="true">▼</span><canvas id="legend-wheel" width="600" height="600" role="img" aria-label="Colorful random-selection wheel with all 28 playable Legends"></canvas></div>
    <div class="wheel-side"><span class="wheel-stamp" id="wheel-available-count">28 AVAILABLE</span><h3>LET FATE<br><em>DECIDE.</em></h3><div class="wheel-pick" id="wheel-pick" role="status" aria-live="polite"><span class="wheel-pick-empty">Waiting for a spin…</span></div><button class="btn pink wheel-spin-button" data-action="spin" id="wheel-spin" type="button">✦ SPIN THE WHEEL</button><button class="btn lilac wheel-share-button" data-action="share-wheel" id="wheel-share" type="button" disabled>◇ COPY MY PICK</button><p class="wheel-help">Optional filters change only the pool, never the daily puzzles.</p><div class="wheel-settings"><label>CLASS <select id="wheel-class">${CLASS_NAMES.map(cl=>`<option value="${cl}" ${wheelRole===cl?'selected':''}>${cl}</option>`).join('')}</select></label><label class="wheel-check"><input id="wheel-repeat" type="checkbox" ${wheelNoRepeat?'checked':''}/> Avoid immediate repeat</label></div></div></div>
    <details class="wheel-roster"><summary>EXCLUDE LEGENDS FROM THE WHEEL</summary><div class="wheel-roster-names" id="wheel-roster-names"></div></details>
  </section>`;
  overlay.addEventListener('click',event=>{if(event.target===overlay)closeWheel();});
  app.appendChild(overlay);
  refreshWheelOptions();overlay.querySelector('[data-action="spin"]')?.focus({preventScroll:true});
}
function closeWheel(){
  if(!wheelOpen)return;
  wheelOpen=false;wheelSpinning=false;wheelChosen=null;wheelDisplayList=null;
  if(wheelAnimation)cancelAnimationFrame(wheelAnimation);
  wheelAnimation=0;document.getElementById('wheel-backdrop')?.remove();
}
function showWheelPick(legend){
  const box=document.getElementById('wheel-pick');if(!box)return;
  wheelChosen=legend;
  box.innerHTML=`<span class="wheel-pick-badge">YOUR NEXT LEGEND</span>${portrait(legend.slug,{alt:legend.name,cls:'balanced'})}<strong>${esc(legend.name)}</strong><small>${esc(legend.role)} · ${esc(legend.signature)}</small>`;
  loadPortraitImages(box);
  document.getElementById('wheel-share')?.removeAttribute('disabled');
  const button=document.getElementById('wheel-spin');if(button){button.disabled=false;button.textContent='↻ SPIN AGAIN';}
  sound('win');
}
function spinWheel(){
  if(wheelSpinning||!wheelOpen)return;
  const list=wheelPool();if(!list.length)return;wheelDisplayList=list;const legend=wheelPick(list);
  const index=list.findIndex(l=>l.name===legend.name);
  const target=destinationRotation(wheelAngle,index,list.length);
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches||!store.settings.motion;
  const duration=reduced?0:4600;
  wheelSpinning=true;wheelChosen=null;
  document.getElementById('wheel-share')?.setAttribute('disabled','');
  const label=document.getElementById('wheel-pick');if(label)label.innerHTML='<span class="wheel-pick-empty">SPINNING THE OUTLANDS…</span>';
  const button=document.getElementById('wheel-spin');if(button){button.disabled=true;button.textContent='✦ SPINNING…';}
  sound('pick');
  const finish=()=>{wheelAngle=((target%(Math.PI*2))+(Math.PI*2))%(Math.PI*2);wheelSpinning=false;drawWheel();showWheelPick(legend);};
  if(!duration){finish();return;}
  const startAngle=wheelAngle;let started=null;
  const frame=stamp=>{
    if(!wheelOpen)return;
    if(started===null)started=stamp;
    const t=Math.min(1,(stamp-started)/duration);
    const ease=1-Math.pow(1-t,5);
    wheelAngle=startAngle+(target-startAngle)*ease;
    drawWheel();
    if(t<1){wheelAnimation=requestAnimationFrame(frame);}else{wheelAnimation=0;finish();}
  };
  wheelAnimation=requestAnimationFrame(frame);
}
async function copyWheelPick(){
  if(!wheelChosen)return;
  const message=`My next Apex Legend: ${wheelChosen.name}! Picked by Guess the Predator — Spin the Wheel.`;
  let copied=false;
  try{await navigator.clipboard.writeText(message);copied=true;}
  catch{
    // Fallback for browsers where Clipboard API is not available on a local preview.
    const field=document.createElement('textarea');field.value=message;
    field.style.position='fixed';field.style.opacity='0';field.setAttribute('aria-hidden','true');
    document.body.appendChild(field);field.select();
    try{copied=document.execCommand('copy');}catch{/* Clipboard permission may be denied. */}
    field.remove();
  }
  const button=document.getElementById('wheel-share');
  if(copied){
    if(button){button.textContent='✓ PICK COPIED';setTimeout(()=>{if(button.isConnected)button.textContent='◇ COPY MY PICK';},1400);}
    showToast(`Copied: ${wheelChosen.name} ✦`);
  }else{
    if(button){button.textContent='COPY UNAVAILABLE';setTimeout(()=>{if(button.isConnected)button.textContent='◇ COPY MY PICK';},1500);}
    showToast(message);
  }
  sound('pick');
}
function render({scroll=true}={}) {
  if(intelModalOpen)closeIntelDialog();
  if(wheelOpen)closeWheel();
  document.body.classList.toggle('lightshift-playing',screen==='game');
  app.className=`app ${store.settings.motion?'':'no-motion'}`;
  app.dataset.screen=screen;app.dataset.session=session;
  app.innerHTML=nav()+(screen==='home'?home():screen==='game'?game():records());
  loadPortraitImages();
  loadAbilityImages();
  loadMapImages();
  if(scroll)window.scrollTo({top:0,behavior:'instant'});
  if(screen==='game'&&!getRound()?.finished)updateSearchResults();
  if(pickerOpen)renderPicker();
}
function openMode(mode,playSession=session){
  if(!MODES.includes(mode))return;
  if(mode==='map'&&mapAvailability!=='ready'){showToast('MAP STAYS DISABLED UNTIL A REAL LOCATION SCREENSHOT LOADS.');return;}
  active=mode;session=playSession;screen='game';pickerOpen=false;quickSearch='';ensureRound();render();sound('nav');
}
function submitGuess(name){
  const round=getRound();if(!round||round.finished)return;
  const next=tryGuess(round,name,legends);
  if(next===round)return;
  const wasWon=round.won;setRound(next);
  if(next.won&&!wasWon){
    store.history.wins=(store.history.wins||0)+1;
    store.history.bestScore=Math.max(store.history.bestScore||0,gameScore(next));sync();sound('win');
  } else {sound(next.signals.at(-1)?.kind==='correct'?'correct':'wrong');if(next.finished)sound('lose');}
  pickerOpen=false;quickSearch='';render({scroll:false});
}
function updateSearchResults(){
  const input=document.querySelector('#guess-search');const box=document.querySelector('#search-results');if(!input||!box)return;
  const query=input.value.trim();if(!query){box.style.display='none';return;}
  const used=getRound()?.guesses||[];
  const matches=filteredRoster(legends,{search:query,excluded:used}).slice(0,7);
  if(!matches.length){box.innerHTML='<div style="padding:12px;font-size:11px;color:#8c6896">No matches</div>';box.style.display='block';return;}
  box.innerHTML=matches.map(l=>`<button class="search-result" data-action="guess" data-name="${esc(l.name)}">${portrait(l.slug,{alt:l.name,cls:'balanced'})}<strong>${esc(l.name)}</strong><small>${esc(l.role)}</small></button>`).join('');
  box.style.display='block';loadPortraitImages(box);
}
function renderPicker(){
  document.getElementById('picker-backdrop')?.remove();
  const overlay=document.createElement('div');overlay.className='picker-backdrop';overlay.id='picker-backdrop';overlay.setAttribute('role','presentation');
  overlay.innerHTML=`<div class="picker gtp2-picker" role="dialog" aria-modal="true" aria-label="Browse Legends">
    <div class="picker-header"><div><span class="kicker">28 LEGENDS / ONE TARGET</span><h2>BROWSE LEGENDS</h2><p>Search, filter and pick. Incorrect guesses are hidden automatically.</p></div><button class="btn flat small" data-action="close-picker" aria-label="Close Legend picker">✕ CLOSE</button></div>
    <div class="picker-search"><input id="picker-search" type="search" autocomplete="off" placeholder="Search a Legend or class…" value="${esc(pickerSearch)}" aria-label="Search Legend roster"/><select id="picker-sort" aria-label="Sort Legends"><option value="az" ${pickerSort==='az'?'selected':''}>A → Z</option><option value="za" ${pickerSort==='za'?'selected':''}>Z → A</option></select></div>
    <div class="class-filters" role="group" aria-label="Filter Legends by class">${CLASS_NAMES.map(cls=>`<button class="filter-btn ${pickerClass===cls?'active':''}" data-action="filter" data-class="${cls}">${cls.toUpperCase()}</button>`).join('')}</div>
    <div class="picker-count" id="picker-count"></div><div class="picker-visual-note">CHARACTER PORTRAITS · ORIGINAL GAME SOURCES WHEN AVAILABLE · NO GENERIC REPLACEMENTS</div><div class="picker-grid" id="picker-grid"></div></div>`;
  overlay.addEventListener('click',event=>{if(event.target===overlay){pickerOpen=false;overlay.remove();}});
  app.appendChild(overlay);renderPickerResults();document.getElementById('picker-search')?.focus({preventScroll:true});
}
function renderPickerResults(){
  const grid=document.getElementById('picker-grid'),count=document.getElementById('picker-count');if(!grid||!count)return;
  const results=filteredRoster(legends,{search:pickerSearch,role:pickerClass,sort:pickerSort,excluded:getRound()?.guesses||[]});
  count.textContent=`${results.length} AVAILABLE · ${(getRound()?.guesses.length||0)} ELIMINATED`;
  grid.innerHTML=results.length?results.map(l=>`<button class="picker-legend gtp2-legend-card" data-action="guess" data-name="${esc(l.name)}">${portrait(l.slug,{alt:l.name,cls:'balanced'})}<strong>${esc(l.name)}</strong><small>${esc(l.role)}</small></button>`).join(''):'<div class="picker-empty">No Legends match these filters.</div>';
  loadPortraitImages(grid);
}
function nextMode(){
  if(session==='unlimited'){randomPractice(active);return;}
  // Skip the current challenge even when it was lost: the old implementation
  // selected the same incomplete round, which made NEXT appear broken.
  const rounds=store.days[today()]||{};
  const available=dailyModes(),currentIndex=available.indexOf(active);
  const next=available.slice(currentIndex+1).find(mode=>!rounds[mode]?.finished)
     ||available.slice(0,currentIndex).find(mode=>!rounds[mode]?.finished);
  if(next){openMode(next,'daily');return;}
  screen='records';pickerOpen=false;render();sound('nav');
}
function showToast(message){
  document.querySelector('.toast')?.remove();
  const toast=document.createElement('div');toast.className='toast';toast.setAttribute('role','status');toast.textContent=message;app.appendChild(toast);
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.remove(),3000);
}
let lastModeHover=0;
app.addEventListener('pointerover',event=>{
  const card=event.target.closest?.('.arena-mode');
  if(!card||!store.settings.audio)return;
  if(event.relatedTarget instanceof Node&&card.contains(event.relatedTarget))return;
  const now=performance.now();if(now-lastModeHover<210)return;lastModeHover=now;
  const mode=card.dataset.mode;
  if(MODES.includes(mode))sound('hover-'+mode);
});
app.addEventListener('click',event=>{
  const button=event.target.closest('[data-action]');if(!button||button.disabled)return;
  const action=button.dataset.action;
  if(action==='intel-open'){const day=store.days[today()]||{};if(!unlockedIntel(day,dailyModes())){showToast('Complete all available daily missions first.');return;}store.intelOpenedDays??={};intelFirstRevealPending=!store.intelOpenedDays[today()];store.intelOpenedDays[today()]=true;sync();intelDialog();}
  else if(action==='intel-close')closeIntelDialog();
  else if(action==='pixel-style'){if(!['mosaic','soft','holo'].includes(button.dataset.style))return;store.settings.pixelStyle=button.dataset.style;sync();render({scroll:false});sound('pick');}
  else if(action==='wheel')showWheel();
  else if(action==='close-wheel')closeWheel();
  else if(action==='spin')spinWheel();
  else if(action==='share-wheel')void copyWheelPick();
  else if(action==='map-guess'){const round=getRound();const entry=resolveLocation(round?.answer);if(!round||!entry)return;const updated=mapGuess(round,button.dataset.name,entry);if(updated===round)return;setRound(updated);if(updated.won){store.history.wins++;sync();sound('win');}else{sound(updated.finished?'lose':'pick');}render({scroll:false});}
  else if(action==='home'){screen='home';pickerOpen=false;render();sound('nav');}
  else if(action==='records'){screen='records';pickerOpen=false;render();sound('nav');}
  else if(action==='open'){openMode(button.dataset.mode);}
  else if(action==='home-daily'){
    session='daily';const next=dailyModes().find(mode=>!store.days[today()]?.[mode]?.finished);
    if(next)openMode(next,'daily');else{screen='records';render();}
  }
  else if(action==='session'){session=button.dataset.session;render({scroll:false});sound('nav');}
  else if(action==='audio'){store.settings.audio=!store.settings.audio;sync();sound('pick');render({scroll:false});}
  else if(action==='sound-test'){if(!store.settings.audio){store.settings.audio=true;sync();}sound('reveal');render({scroll:false});}
  else if(action==='motion'){store.settings.motion=!store.settings.motion;sync();render({scroll:false});}
  else if(action==='picker'){pickerOpen=true;pickerSearch='';pickerClass='All';pickerSort='az';renderPicker();sound('pick');}
  else if(action==='close-picker'){pickerOpen=false;document.getElementById('picker-backdrop')?.remove();}
  else if(action==='guess'){submitGuess(button.dataset.name);}
  else if(action==='submit-search'){
    const query=document.getElementById('guess-search')?.value||'';
    const first=filteredRoster(legends,{search:query,excluded:getRound()?.guesses||[]})[0];if(query.trim()&&first)submitGuess(first.name);
  }
  else if(action==='style'||action==='rush'){
    const round=getRound();if(!round||round.guesses.length||round.finished)return;
    const changed=action==='style'?{...round,mode:button.dataset.style}:{...round,timeLimit:round.timeLimit?0:180};
    store.settings.playStyle=changed.mode;store.settings.rush=changed.timeLimit>0;setRound(changed);
    sync();render({scroll:false});sound('pick');
  }
  else if(action==='hint'){
    const round=getRound();if(!round)return;
    const target=legendByName(legends,round.answer);const changed=getHint(round,target,legends);
    if(changed!==round){setRound(changed);render({scroll:false});sound('clue');}
  }
  else if(action==='filter'){pickerClass=button.dataset.class;renderPicker();sound('nav');}
  else if(action==='next')nextMode();
  else if(action==='again')randomPractice(active);
});
app.addEventListener('input',event=>{
  if(event.target.id==='guess-search'){quickSearch=event.target.value;updateSearchResults();}
  if(event.target.id==='picker-search'){pickerSearch=event.target.value;renderPickerResults();}
  if(event.target.id==='picker-sort'){pickerSort=event.target.value;renderPickerResults();}
});
app.addEventListener('change',event=>{
  if(event.target.id==='wheel-class'&&!wheelSpinning){wheelRole=event.target.value;wheelChosen=null;wheelAngle=0;refreshWheelOptions();}
  if(event.target.id==='wheel-repeat'&&!wheelSpinning){wheelNoRepeat=event.target.checked;refreshWheelOptions();}
  if(!wheelSpinning&&event.target.dataset?.wheelExclude){const name=event.target.dataset.wheelExclude;event.target.checked?wheelExcluded.add(name):wheelExcluded.delete(name);wheelAngle=0;refreshWheelOptions();}
if(event.target.id==='picker-sort'){pickerSort=event.target.value;renderPickerResults();}});
document.addEventListener('keydown',event=>{
  if(intelModalOpen&&event.key==='Tab'){
    const nodes=[...document.querySelectorAll('#intel-dialog button:not(:disabled)')];
    if(nodes.length){const current=nodes.indexOf(document.activeElement);if(current===-1||(!event.shiftKey&&current===nodes.length-1)||(event.shiftKey&&current===0)){event.preventDefault();nodes[event.shiftKey?nodes.length-1:0].focus();}}
    return;
  }
  if(wheelOpen&&event.key==='Tab'){
    const focusables=[...document.querySelectorAll('#wheel-backdrop button:not(:disabled), #wheel-backdrop summary')];
    if(focusables.length){
      const index=focusables.indexOf(document.activeElement);
      if(index===-1||(!event.shiftKey&&index===focusables.length-1)||(event.shiftKey&&index===0)){
        event.preventDefault();focusables[event.shiftKey?focusables.length-1:0].focus();
      }
    }
  }
  if(event.key==='Escape'){
    if(intelModalOpen){closeIntelDialog();return;}
    if(wheelOpen){closeWheel();return;}
    if(pickerOpen){pickerOpen=false;document.getElementById('picker-backdrop')?.remove();}
    else if(document.activeElement instanceof HTMLElement)document.activeElement.blur();return;
  }
  if(screen!=='game'||getRound()?.finished)return;
  if(pickerOpen){if(event.key==='Enter'){
    const first=filteredRoster(legends,{search:pickerSearch,role:pickerClass,sort:pickerSort,excluded:getRound()?.guesses||[]})[0];if(first){submitGuess(first.name);event.preventDefault();}
  }return;}
  const typing=event.target instanceof HTMLInputElement||event.target instanceof HTMLTextAreaElement;
  if(!typing&&(event.key==='g'||event.key==='G')){event.preventDefault();pickerOpen=true;pickerSearch='';pickerClass='All';pickerSort='az';renderPicker();}
  if(!typing&&event.key==='/'){event.preventDefault();document.getElementById('guess-search')?.focus();}
  if(event.key==='Enter'&&event.target.id==='guess-search'){
    const query=event.target.value;const first=filteredRoster(legends,{search:query,excluded:getRound()?.guesses||[]})[0];if(query.trim()&&first)submitGuess(first.name);event.preventDefault();
  }
});
let lastSpotlightUTC=utcDay();
setInterval(()=>{
  const currentUTC=utcDay();
  if(currentUTC!==lastSpotlightUTC){
    lastSpotlightUTC=currentUTC;
    if(screen==='home'&&!wheelOpen){render({scroll:false});}
  }
  if(screen!=='game')return;
  const round=getRound();if(!round)return;
  if(active==='map')return;
  const expired=expireRound(round,Date.now());
  if(expired!==round){setRound(expired);sound('lose');render({scroll:false});return;}
  const timer=document.getElementById('round-timer');if(timer){const time=remainingTime(round);timer.querySelector('span').textContent=`${time}s`;timer.classList.toggle('urgent',time<=25&&!round.finished);}
},500);
render();
void startMapPreflight();

