import {TIPS,unlockedIntel,tipFor} from './tips.mjs?v=2.13.0';
import {legends} from './data.mjs?v=2.13.0';
import {artCatalog} from './art.mjs?v=2.13.0';
import {abilityCandidates,localAbilitySlugs} from './abilities.mjs?v=2.13.0';
import {dailySpotlight,wheelChoices,wheelPick,destinationRotation} from './spotlight.mjs?v=2.13.0';
import {playSound} from './audio.mjs?v=2.13.0';
import {paintPixelScene} from './pixel_scene.mjs?v=2.13.0';
import {getBoards, submitDaily, leaderboardConfigured} from './leaderboard.mjs?v=2.13.0';
import {dailySummary, buildSubmission} from './scoring.mjs?v=2.13.0';
import {loadStore,saveStore} from './store.mjs?v=2.13.0';
import {FIELDS,LABELS,MODES,MODE_NAMES,CLASS_NAMES,MAX_GUESSES,MAX_HINTS,maxGuesses,utcDay,puzzleAnswers,newRound,tryGuess,expireRound,
  getHint,availableHintFields,formatValue,gameScore,gameRank,scannerState,filteredRoster,remainingTime,dayCount,streak,legendByName} from './engine.mjs?v=2.13.0';

const app=document.getElementById('app');
let store=loadStore();
const dailyModes=()=>MODES;
let screen='home';
let session='daily';
let active='classic';
let boardTab='daily';
let boardData=null;
let boardLoading=false;
let boardError='';
let pickerOpen=false;
let pickerSearch='';
let pickerClass='All';
let pickerSort='az';
let quickSearch='';
let toastTimer=null;
let wheelOpen=false;
let wheelNoRepeat=true;
let wheelAnimation=0;
let wheelAngle=0;
let wheelSpinning=false;
let wheelChosen=null;
let wheelDisplayList=null;
let identityPromptOpen=false;
const COLORS={classic:'#f879bd',pixel:'#81e9e9',quote:'#ed87bc',ability:'#83e5de',emoji:'#cf7bb9'};
const ICONS={classic:'❔',pixel:'▦',quote:'❞',ability:'⌁',emoji:'✧'};
const TAGLINES={classic:'Deduce the target with every signal.',pixel:'Reveal the legend, not the background.',quote:'Who wrote this intercepted line?',ability:'Identify the passive ability icon.',emoji:'Five symbols. One legend.'};
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
const savedNickname=()=>String(store.profile?.nickname||'').trim();
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
    if(round.mode==='full'&&!round.finished&&round.guesses?.length>=5){
      round={...round,finished:true,won:false,loss:'attempts',finishedAt:Date.now()};
      if(playSession==='daily')store.days[today()][mode]=round;
      else store.practice[mode]=round;
      sync();
    }
    return round;
  }
  const eligible=mode==='ability'?legends.filter(l=>localAbilitySlugs.includes(l.slug)):legends;
  const answer=playSession==='daily'?answers()[mode]:eligible[Math.floor(Math.random()*eligible.length)].name;
  round=newRound(answer,store.settings.playStyle,store.settings.rush?120:0);
  if(playSession==='daily')store.days[today()]={...store.days[today()],[mode]:round};
  else store.practice[mode]=round;
  sync();
  return round;
}
function randomPractice(mode=active){
  const last=store.practice[mode]?.answer;
  const pool=legends.filter(l=>l.name!==last&&(mode!=='ability'||localAbilitySlugs.includes(l.slug)));
  store.practice[mode]=newRound(pool[Math.floor(Math.random()*pool.length)].name,store.settings.playStyle,store.settings.rush?120:0);
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
  const result=paintPixelScene(canvas,image,{resolution:Number(canvas.dataset.resolution)||28,seed:'neutral-arena'});
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

function identityPrompt(){
  const value=esc(savedNickname());
  return `<div class="identity-backdrop" id="identity-backdrop" role="presentation"><section class="identity-modal" role="dialog" aria-modal="true" aria-labelledby="identity-title"><button class="identity-close" type="button" data-action="identity-skip" aria-label="Close nickname dialog">✕</button><span class="identity-kicker">PUBLIC RANKINGS / SAVED LOCALLY</span><h2 id="identity-title">CHOOSE YOUR <em>NICKNAME.</em></h2><p>This name appears automatically when you submit Daily scores and stays saved on this device. You can change it later anytime.</p><form id="identity-form" class="identity-form"><label for="identity-name">PLAYER NICKNAME</label><input id="identity-name" name="nickname" minlength="3" maxlength="18" autocomplete="nickname" pattern="[A-Za-z0-9 _-]{3,18}" placeholder="Example: MirageMain" value="${value}" required/><small>3–18 characters · letters, numbers, spaces, _ or -</small><div class="identity-actions"><button class="btn pink" type="submit">SAVE NICKNAME ↗</button><button class="btn lilac" type="button" data-action="identity-skip">MAYBE LATER</button></div><p class="identity-note">This only stores a public nickname, not personal details.</p></form></section></div>`;
}
function openIdentityPrompt(force=false){
  if(identityPromptOpen)return;
  if(!force&&store.profile?.askedName)return;
  identityPromptOpen=true;
  const wrapper=document.createElement('div');
  wrapper.innerHTML=identityPrompt();
  const node=wrapper.firstElementChild;
  node.addEventListener('click',event=>{if(event.target===node)closeIdentityPrompt();});
  app.appendChild(node);
  document.getElementById('identity-name')?.focus({preventScroll:true});
}
function closeIdentityPrompt(markAsked=true){
  identityPromptOpen=false;
  if(markAsked){store.profile={...(store.profile||{}),askedName:true};sync();}
  document.getElementById('identity-backdrop')?.remove();
}
function saveNickname(name,{close=true}={}){
  const clean=String(name||'').trim().replace(/\s+/g,' ');
  store.profile={...(store.profile||{}),nickname:clean,askedName:true};
  sync();
  const input=document.getElementById('board-nickname');if(input)input.value=clean;
  if(close)closeIdentityPrompt(false);
  return clean;
}
function edgeArenaDecor(){
  return `<aside class="edge-arena edge-arena-left" aria-hidden="true"><div class="edge-stitch"></div><span class="edge-glyph">△</span><span class="edge-label">OUTLANDS<br>AFTER HOURS</span><span class="edge-spark">✦ ✧</span></aside><aside class="edge-arena edge-arena-right" aria-hidden="true"><div class="edge-stitch"></div><span class="edge-glyph">◈</span><span class="edge-label">MIRAGE'S<br>HAUNTED ARENA</span><span class="edge-spark">✧ ✦</span></aside>`;
}
// The character is painted only once inside the backdrop art. No artificial gaze overlay.
function nav(){const nick=savedNickname();return `<header class="top gtp2-top"><div class="gtp2-top-inner">
  <button class="brand gtp2-brand" data-action="home" aria-label="Guess the Predator home"><span class="brand-icon" aria-hidden="true"><svg class="seby-apex-mark" viewBox="0 0 64 64" role="img" aria-label="Angular letter A logo"><path d="M32 5 55 56H43L32 28 21 56H9Z" fill="currentColor"/><path d="M21 45h22l-4-9H25Z" fill="#180b2b"/><path d="M23 56 32 37l9 19" fill="none" stroke="#ffb7de" stroke-width="2.2"/></svg></span><span class="brand-text"><strong>GUESS THE <em>PREDATOR</em></strong></span></button>
  <nav class="topnav" aria-label="Main navigation"><button class="nav-item ${screen==='home'?'active':''}" data-action="home">⌂ HOME</button><button class="nav-item ${screen==='game'?'active':''}" data-action="open" data-mode="classic">◈ PLAY</button><button class="nav-item ${screen==='leaderboard'?'active':''}" data-action="leaderboard">♛ RANKINGS</button><button class="nav-item ${screen==='records'?'active':''}" data-action="records">▤ STATS</button><button class="nav-item ${screen==='howto'?'active':''}" data-action="howto">? HOW TO PLAY</button><button class="nav-item ${screen==='faq'?'active':''}" data-action="faq">◉ FAQ</button></nav>
  <details class="gtp213-mobile-menu"><summary aria-label="Open site navigation">☰</summary><div class="gtp213-mobile-links"><button data-action="home" type="button">⌂ HOME</button><button data-action="open" data-mode="classic" type="button">◈ PLAY</button><button data-action="leaderboard" type="button">♛ RANKINGS</button><button data-action="records" type="button">▤ STATS</button><button data-action="howto" type="button">? HOW TO PLAY</button><button data-action="faq" type="button">◉ FAQ</button></div></details>
  <div class="top-actions"><button class="switch gtp2-profile-switch" data-action="profile" aria-label="Choose nickname">${nick?`◉ ${esc(nick)}`:'◎ NICKNAME'}</button><button class="switch gtp2-sound-switch" data-action="audio" aria-label="Toggle sound" aria-pressed="${store.settings.audio}">${store.settings.audio?'♫ FX ON':'♪ FX OFF'}</button></div>
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
function homeFeatureDock(){
 const legend=dailySpotlight(utcDay(),legends);
 const rounds=store.days[today()]||{};
 const complete=dailyModes().filter(mode=>rounds[mode]?.finished).length;
 const total=dailyModes().length;
 const unlocked=unlockedIntel(rounds,dailyModes());
 const claimed=Boolean(store.intelOpenedDays?.[today()]);
 return `<section class="gtp213-dock" aria-label="Next game, daily progress and legend of the day">
  <article class="gtp213-dock-card gtp213-dock-wheel"><span class="gtp213-dock-kicker">◈ PLAY SOMETHING DIFFERENT</span><div class="gtp213-dock-main"><span class="gtp213-dock-icon" aria-hidden="true">✺</span><div><h3>NEXT GAME <em>LEGEND.</em></h3><p>Spin for a random Legend to play next.</p></div></div><button type="button" data-action="wheel">✦ SPIN THE WHEEL <span aria-hidden="true">↗</span></button></article>
  <article class="gtp213-dock-card gtp213-dock-intel"><span class="gtp213-dock-kicker">✧ DAILY REWARD / ${complete} OF ${total}</span><h3>FORBIDDEN <em>INTEL.</em></h3><div class="gtp213-dock-progress" role="progressbar" aria-label="Daily missions completed" aria-valuenow="${complete}" aria-valuemin="0" aria-valuemax="${total}"><span style="width:${complete/total*100}%"></span></div><button type="button" data-action="intel-open" ${unlocked?'':'disabled'}>${unlocked?(claimed?'✦ VIEW TODAY’S INTEL':'✦ UNLOCK YOUR INTEL'):`◆ ${complete}/${total} DAILY CHALLENGES`}</button></article>
  <article class="gtp213-dock-card gtp213-dock-legend"><div class="gtp213-dock-portrait">${portrait(legend.slug,{alt:'',cls:'balanced'})}</div><div class="gtp213-dock-legend-copy"><span class="gtp213-dock-kicker">✳ LEGEND OF THE DAY</span><h3>${esc(legend.name)}</h3><p>${esc(legend.role)} · ${esc(legend.signature)}</p><small>NEW PICK EVERY DAY</small></div></article>
 </section>`;
}
function modeTile(mode,i){
 const round=store.days[today()]?.[mode];
 const status=session==='daily'&&round?.finished?(round.won?'✓ CLEARED':'✓ COMPLETED'):'PLAY NOW ↗';
 return `<button class="arena-mode gtp2-mode-card gtp2-card-${mode} ${round?.finished&&session==='daily'?'finished':''}" data-action="open" data-mode="${mode}" style="--tile:${classOf(mode)}" aria-label="Play ${MODE_NAMES[mode]}">
   <span class="gtp2-mode-number">0${i+1}</span><span class="gtp2-mode-glyph" aria-hidden="true">${ICONS[mode]}</span>
   <span class="gtp2-mode-copy"><strong>${MODE_NAMES[mode]}</strong><small>${TAGLINES[mode]}</small><em>${status}</em></span><span class="gtp2-mode-arrow">❯</span>
 </button>`;
}
function home(){
 const unfinished=dailyModes().filter(mode=>!store.days[today()]?.[mode]?.finished);
 const done=dailyModes().length-unfinished.length;
 return `<main class="gtp2-home">
  <section class="gtp2-hero nova27-home" aria-label="Guess the Predator — five game modes">
   <img id="gtp2-backdrop" class="gtp2-backdrop" src="./assets/decor/haunted-hero.webp" alt="" aria-hidden="true" fetchpriority="high"/>
   <div class="gtp2-vignette" aria-hidden="true"></div>
   <div class="gtp2-hero-content">
     <div class="gtp2-heading"><div><span class="gtp2-kicker">✦ FIVE MISSIONS · ONE MYSTERY</span><h1>GUESS THE <span>PREDATOR.</span></h1><p>Five puzzles. A new target every day.</p></div><div class="gtp2-progress"><small>DAILY · ${esc(today())}</small><strong>${done}<em>/5</em></strong><span>MISSIONS CLEARED</span></div></div>
     <div class="gtp2-switchline gtp27-session-picker"><div class="gtp2-session" role="group" aria-label="Play type"><button data-action="session" data-session="daily" class="${session==='daily'?'active':''}" aria-pressed="${session==='daily'}">◈ DAILY CHALLENGE</button><button data-action="session" data-session="unlimited" class="${session==='unlimited'?'active':''}" aria-pressed="${session==='unlimited'}">∞ FREE PLAY</button></div><span>${session==='daily'?'ONE SCORE PER DAY':'UNLIMITED PRACTICE'}</span></div>
     <div class="gtp212-cascade" aria-label="Five playable daily modes">
       ${['classic','pixel','quote','ability','emoji'].map((mode,i)=>`<div class="gtp212-step gtp212-step-${mode}">${modeTile(mode,i)}</div>`).join('')}
       <div class="gtp212-cascade-label" aria-hidden="true"><small>SELECT YOUR SIGNAL</small><strong>FIVE MODES<span>.</span></strong><span>ONE MYSTERY EVERY DAY</span></div>
     </div>
     <div class="gtp2-hero-footer gtp28-hero-footer"><div class="gtp28-daily-progress"><span class="gtp28-live-dot"></span><span>FIVE MODES · ${session==='daily'?`${done}/5 DAILY CLEARED`:'PRACTICE MODE'}</span></div><div class="gtp28-primary-row">${session==='daily'?`<button data-action="home-daily" class="gtp2-primary gtp28-play-btn">${unfinished.length?'◈ CONTINUE DAILY':'✦ VIEW YOUR DAILY SCORE'} <span>↗</span></button>`:`<button data-action="open" data-mode="classic" class="gtp2-primary gtp28-play-btn">∞ START FREE PLAY <span>↗</span></button>`}</div><button class="gtp27-rank-link gtp28-rank-btn" data-action="leaderboard">♛ GLOBAL RANKINGS <span>↗</span></button></div>
     ${homeFeatureDock()}
     <footer class="gtp213-credit"><strong>Made by Sebyby</strong><span>Independent fan trivia · Not affiliated with EA or Respawn · Artwork subject to third-party rights</span></footer>
   </div>
  </section>
 </main>`;
}
function getVisual(round,target){
  const mode=active;
  if(mode==='pixel'){
    const effect='soft';
    const step=Math.min(round.guesses.length,6);
    // Pixelate and blur the FULL COMPOSITE SCENE (location, lights, character), not a lone cutout.
    const sizes=[9,12,16,26,40,82,900];
    const blur=effect==='soft'?[40,35,29,23,16,8,0]:effect==='holo'?[18,16,13,9,6,3,0]:[16,14,11,8,5,2,0];
    const pct=[6,15,28,46,66,84,100];
    const size=effect==='soft'?900:sizes[step];
    return `<div class="clue-visual visual-pixel px-effect-${effect} nova-pixel-scene"><div class="pixel-art" style="--px-blur:${blur[step]}px;--px-progress:${pct[step]}%">
      <canvas class="pixel-canvas" data-resolution="${size}" width="${size}" height="${size}" aria-label="Progressively decrypted full scene featuring a Legend"></canvas>
      ${portrait(target.slug,{alt:'',cls:'pixel-source',concealed:!round.finished,eager:true})}
      <div class="pixel-fallback" role="group" aria-label="Offline character identity clues"><span class="pixel-fallback-kicker">◈ BACKUP INTEL / SIGNAL RECOVERY</span><div class="pixel-fallback-emblem">${step>=4?esc((target.emoji.split(/\s+/)[0]||'◇')):'?'}</div><strong>${step>=3?esc(target.role.toUpperCase()):'CLASSIFIED ROLE'}</strong><p>${step>=5?esc(target.title):'IDENTITY PROFILE ENCRYPTED'}</p><small>${step>=6?esc(target.signature):'ADDITIONAL INTEL UNLOCKS AFTER GUESSES'}</small></div><div class="pixel-error" aria-hidden="true"></div><div class="pixel-scratch scratch-a"></div><div class="pixel-scratch scratch-b"></div><div class="pixel-scan"></div><div class="pixel-vignette"></div>
      </div><div class="pixel-dots"></div><div class="pixel-caption">DECRYPTION ${pct[step]}% · ${maxGuesses(round)-round.guesses.length} MOVES LEFT</div><div class="pixel-effect-label" aria-label="Soft blur effect">◌ SOFT BLUR</div></div>`;
  }
  if(mode==='quote')return `<div class="clue-visual gtp2-quote-rework gtp29-quote-visual"><div class="gtp2-quote-head"><span>◈ WRITTEN CLUE / NO VOICE IMPERSONATION</span><span>CHANNEL 0${MODES.indexOf(active)+1}</span></div><div class="gtp29-quote-card"><blockquote>“${esc(target.quote)}”</blockquote><div class="gtp29-quote-footer"><span class="gtp2-live-dot"></span><b>SPEAKER UNKNOWN</b><small>Use class, age and launch comparisons to narrow it down.</small></div></div></div>`;
  if(mode==='ability')return `<div class="clue-visual visual-ability gtp210-ability-stage" aria-label="Ability icon puzzle">
    <div class="gtp210-clue-top"><span><i class="gtp210-live-dot"></i> ABILITY / PASSIVE</span><small>FILE 04 · CLASSIFIED</small></div>
    <div class="gtp210-ability-core">
      <div class="gtp210-orbit-detail" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
      <div class="ability-symbol gtp210-ability-icon" role="img" aria-label="Mystery Legend ability icon"><img data-ability="${esc(target.slug)}" alt="" loading="eager"/><span class="ability-wait">LOADING<br>ABILITY ICON…</span><span class="ability-fail">ABILITY ICON<br>UNAVAILABLE</span></div>
      <div class="gtp210-scan-tag">VISUAL SCAN // 01</div>
    </div>
    <div class="gtp210-clue-bottom"><strong>RECOGNIZE THE ABILITY.</strong><span>Identify the Legend from the icon above.</span></div>
  </div>`;
  if(mode==='emoji'){
    const all=[...target.emoji.split(/\s+/),...target.extraEmoji];
    const shown=Math.min(all.length,3+Math.floor(round.guesses.length/2));
    return `<div class="clue-visual visual-emoji gtp210-emoji-stage" aria-label="Emoji puzzle: ${shown} of ${all.length} symbols visible">
      <div class="gtp210-clue-top"><span><i class="gtp210-live-dot"></i> EMOJI / DECRYPTION</span><small>${shown} / ${all.length} UNLOCKED</small></div>
      <div class="gtp210-emoji-core">
        <span class="gtp210-inner-kicker">FIVE SYMBOLS. ONE LEGEND.</span>
        <div class="gtp210-emoji-slots" role="group" aria-label="Emoji clues">${all.map((symbol,i)=>`<span class="gtp210-emoji-tile ${i>=shown?'is-locked':'is-visible'}" aria-label="${i<shown?'Visible clue '+(i+1):'Locked clue '+(i+1)}"><span>${i<shown?esc(symbol):'<b aria-hidden="true">?</b>'}</span><small>0${i+1}</small></span>`).join('')}</div>
        <div class="gtp210-reveal-track" aria-hidden="true">${all.map((_,i)=>`<span class="${i<shown?'is-lit':''}"></span>`).join('')}</div>
      </div>
      <div class="gtp210-clue-bottom"><strong>${shown===all.length?'ALL FIVE CLUES REVEALED':'DECRYPT THE REMAINING CLUES.'}</strong><span>${shown===all.length?'You have every symbol — make your final guess.':'More symbols unlock as you make guesses.'}</span></div>
    </div>`;
  }
  return `<div class="clue-visual gtp27-mystery gtp29-classic-visual"><div class="gtp29-question-emblem" aria-hidden="true">?</div><div class="mystery-wording"><small>LEGEND UNKNOWN</small><strong>WHO’S THAT LEGEND?</strong><span>Use each guess to reveal the right identity.</span></div></div>`;
}
function modeRail(){return `<nav class="mode-rail" aria-label="Switch game mode">${MODES.map(mode=>`<button class="mode-tab ${active===mode?'active':''} ${session==='daily'&&store.days[today()]?.[mode]?.won?'done':''}" style="--tile:${classOf(mode)}" data-action="open" data-mode="${mode}" ><b>${ICONS[mode]}</b><span>${MODE_NAMES[mode]}</span></button>`).join('')}</nav>`;}
function styleStrip(round){
  const locked=round.guesses.length>0||round.finished;
  return `<div class="style-strip" aria-label="Round rules">
    <div><strong>HOW MUCH INTEL PER GUESS?</strong><div class="style-description">${round.mode==='signal'?'MYSTERY: one trait comparison per guess':'FULL SCAN: reveal all six traits'}</div></div>
    <div class="style-options" role="group" aria-label="Choose feedback"><button class="segment ${round.mode==='signal'?'active':''}" data-action="style" data-style="signal" ${locked?'disabled':''}>✦ ONE SIGNAL</button><button class="segment ${round.mode==='full'?'active':''}" data-action="style" data-style="full" ${locked?'disabled':''}>▦ FULL SCAN</button><button class="segment rush-btn ${round.timeLimit?'active':''}" data-action="rush" ${locked?'disabled':''}>⌛ RUSH ${round.timeLimit?round.timeLimit+'s':'OFF'}</button></div>
  </div>`;
}
function latestSignal(round,target){
  if(!round.guesses.length)return `<div class="flash idle"><span class="signal-mark">✧</span><span><strong>AWAITING YOUR FIRST GUESS</strong><small>Your next guess will reveal ${round.mode==='signal'?'one of the six traits':'all six traits'}.</small></span></div>`;
  if(round.mode==='full')return `<div class="flash idle"><span class="signal-mark">▦</span><span><strong>FULL SCAN RECEIVED</strong><small>Compare all six traits below. Matches stay green.</small></span></div>`;
  const s=round.signals.at(-1);
  if(!s)return `<div class="flash idle"><span class="signal-mark">⌁</span><span><strong>NO NEW SIGNAL</strong><small>All remaining comparable fields were already revealed.</small></span></div>`;
  const correct=s.kind==='correct';
  return `<div class="flash intel-neutral" role="status"><span class="signal-mark">⌁</span><span><strong>${esc(s.guess)} · ${LABELS[s.field]} ${correct?'TRAIT MATCH':'TRAIT DIFFERENCE'}${s.direction?s.direction>0?' ↑':' ↓':''}</strong><small>${esc(s.value)} ${s.direction?(s.direction>0?'· Target has a higher value':'· Target has a lower value'):correct?'· Only this trait matches — target not found':'· Keep investigating'} · NOT A WIN</small></span></div>`;
}
function scannerMarkup(round,target){
  const scanner=scannerState(round,target,legends);
  const lastField=round.signals.at(-1)?.field;
  const cells=FIELDS.map(field=>{
    const signal=scanner[field];const kind=signal.kind;
    const css=kind==='correct'?'good':kind==='wrong'?'bad':kind==='hint'?'hinted':kind==='unknown'?'unknown':'';
    const direction=signal.direction>0?'↑':signal.direction<0?'↓':'';
    return `<div class="scan-cell ${css} ${field===lastField?'new':''}" title="${LABELS[field]}" aria-label="${LABELS[field]} ${kind}"><small>${LABELS[field]}</small><strong>${kind==='unknown'?'UNKNOWN':kind==='hidden'?'—':esc(signal.value)}${direction?' '+direction:''}</strong><span>${kind==='correct'?'✓ MATCH':kind==='wrong'?'× MISS':kind==='hint'?'✓ HINT MATCH':kind==='unknown'?'UNKNOWN':'—'}</span></div>`;
  }).join('');
  const remaining=availableHintFields(round,target,legends);
  const disabled=round.finished||round.guesses.length===0||round.hints.length>=MAX_HINTS||remaining.length===0;
  return `<div class="scanner-head"><strong>◈ IDENTITY SIGNAL BOARD</strong><small>GREEN = MATCH / HINT · CYAN = INTEL</small></div>
  <div class="scanner" role="group" aria-label="Legend scanner">${cells}</div>
  <div class="hint-row"><button class="btn lilac small" data-action="hint" ${disabled?'disabled':''}>✧ SMART HINT · ${MAX_HINTS-round.hints.length} LEFT</button><small>Reveals a correct trait in green</small></div>`;
}
function guessBody(round,target){
  if(round.finished){
    const score=gameScore(round);const rank=gameRank(score);const badges=styleBadges(round);
    return `<div class="end-panel ${round.won?'gtp212-victory':''}"><span class="rank">${round.won?rank:'—'}</span><h2>${round.won?'TARGET FOUND!':round.loss==='time'?'TIME’S UP.':'NICE TRY.'}</h2><p>${round.won?`You identified ${esc(target.name)} in ${round.guesses.length} guesses. ${score} points earned.`:`Your mystery Legend was ${esc(target.name)}. Every guess counts. Try another round!`}</p>${badges.length?`<div class="medal-row">${badges.map(tag=>`<span class="medal">${esc(tag)}</span>`).join('')}</div>`:''}<div class="answer-tag">${portrait(target.slug,{alt:target.name,cls:'balanced'})}<strong>${esc(target.name)}</strong></div>
      <div class="end-actions"><button class="btn pink" data-action="next">${session==='daily'?(dailySummary(store.days,today()).completed?'POST DAILY SCORE':'NEXT CHALLENGE'):'TRY AGAIN'} ↗</button><button class="btn lilac" data-action="again">∞ FREE PLAY</button><button class="btn ghost" data-action="home">ALL MODES</button></div></div>`;
  }
  return `<div class="guess-top"><div><small>YOUR NEXT MOVE</small><h2>WHO’S THAT <span style="color:#ef4895">LEGEND?</span></h2></div><span class="pill">${round.guesses.length}/${maxGuesses(round)} GUESSES · ${maxGuesses(round)-round.guesses.length} LEFT</span></div>
  <div class="search-wrap"><input id="guess-search" autocomplete="off" aria-label="Search a Legend" placeholder="Type a Legend name…" value="${esc(quickSearch)}"/><button class="btn pink small" data-action="submit-search" title="Guess first matching Legend">↗</button><div id="search-results" class="search-list" style="display:none"></div></div>
  <div class="guess-tools"><button class="btn mint small" data-action="picker">◫ BROWSE LEGENDS</button><small>Filter by class · Guess faster · Press G</small></div>
  ${latestSignal(round,target)}${round.guesses.length?`<div class="gtp28-instant-history" aria-label="Previous attempts"><b>GUESS HISTORY</b>${round.guesses.map((name,i)=>`<span>${i+1}. ${esc(name)}</span>`).join('')}</div>`:''}${scannerMarkup(round,target)}
  <div class="tried-list" aria-label="Eliminated guesses">${round.guesses.length?round.guesses.map(name=>`<span class="used">${esc(name)}</span>`).join(''):'<span style="color:#875d91;font-size:10px;font-weight:800">No Legends eliminated yet · open Browse for faster reads</span>'}</div>`;
}
function game(){
  const round=ensureRound();const target=legendByName(legends,round.answer);
  const timeLeft=remainingTime(round);const urgent=timeLeft!=null&&timeLeft<=25&&!round.finished;
  return `<main class="wrap game gtp2-game-scene gtp2-scene-${active}" style="--tile:${classOf(active)}"><div class="game-topline"><button class="tiny-link" data-action="home">← BACK TO MODES</button><span class="pill">${sharedDay?'◇ SHARED DAILY · '+today():session==='daily'?'◉ DAILY / '+today():'∞ FREE PLAY'}</span></div>
  <div class="game-titlebar"><div><span class="kicker">SIGNAL FILE / 0${MODES.indexOf(active)+1}</span><h1>${MODE_NAMES[active]}<span style="color:#e94499">.</span></h1><p>${TAGLINES[active]}</p></div>
  <div class="game-status">${round.timeLimit?`<div id="round-timer" class="game-timer ${urgent?'urgent':''}" aria-label="Time remaining"><i>◷</i><span>${timeLeft??120}s</span></div>`:''}<span class="game-attempts">${maxGuesses(round)-round.guesses.length}<small> LEFT</small></span></div></div>
  ${modeRail()}${styleStrip(round)}
  ${active==='classic'?`<div class="gtp27-classic-banner"><span class="gtp27-question-symbol">?</span><div><small>CLASSIFIED IDENTITY / DAILY SIGNAL</small><strong>WHO'S THAT <em>LEGEND?</em></strong></div><span class="gtp27-banner-note">THE ANSWER IS ONE GUESS AWAY.</span></div>`:''}
  <div class="game-layout"><section class="clue-card" aria-label="Challenge clue"><div class="panel-top"><span>✧ TRANSMISSION / ${MODE_NAMES[active]}</span><small>IDENTITY HIDDEN</small></div>${getVisual(round,target)}<div class="clue-foot"><span>✧ ${active==='quote'?'ORIGINAL FAN CLUE':active==='pixel'?'PIXEL SCRAMBLER':'SIX-TRAIT MYSTERY'}</span><span>${round.finished?'FILE DECLASSIFIED':'NO SPOILERS'}</span></div></section>
  <section class="guess-card" aria-label="Guess the Legend"><div class="panel-top"><span>⌁ GUESS TERMINAL</span><small>${round.mode==='signal'?'ONE-SIGNAL INTEL':'FULL CLASSIC INTEL'}</small></div><div class="guess-body">${guessBody(round,target)}</div></section></div>
  ${round.guesses.length?`<section class="game-bottom"><div class="bottom-card"><h3>SIGNAL HISTORY</h3><div class="signal-log">${round.guesses.map((name,i)=>`<span class="log-item ${name===target.name?'match':'mismatch'}">${i+1}. ${esc(name)} ${name===target.name?'✓ TARGET FOUND':'× ELIMINATED'}</span>`).join('')}</div></div></section>`:''}</main>`;
}
function howTo(){return `<main class="wrap gtp27-guide" aria-labelledby="guide-title"><span class="kicker">FIELD GUIDE · FIVE WAYS TO PLAY</span><h1 id="guide-title">HOW TO <em>PLAY.</em></h1><p>Choose Daily for one shared puzzle per mode every UTC day, or Free Play for unlimited practice. Find the mystery Legend using up to six guesses (five in Full Scan).</p>
  <div class="guide-grid">${[
   ['❔','CLASSIC','Guess any Legend. Green means a matching trait, not necessarily the correct Legend. Pink means a different trait. One Signal shows one comparison per guess.'],
   ['▦','PIXEL','The same neutral background hides a Legend in stages. Guess to reveal more detail. Soft Blur progressively reveals the Legend.'],
   ['❞','QUOTE','Identify the Legend from a written character clue. No synthetic voices.'],
   ['⌁','ABILITY','Recognize a real locally installed passive ability icon. Verified local icons enter the mystery pool.'],
   ['✧','EMOJI','Read themed symbols about abilities, personality and lore. More symbols unlock after guesses.']
  ].map(([ico,title,desc])=>`<article class="guide-card"><span>${ico}</span><h2>${title}</h2><p>${desc}</p></article>`).join('')}</div>
  <div class="guide-rule-row"><article><b>◈ ONE SIGNAL</b><p>One neutral comparison banner per incorrect guess; up to six attempts. The green scanner cells confirm individual traits, not the entire Legend.</p></article><article><b>▦ FULL SCAN</b><p>All six traits per guess, but only five attempts.</p></article><article><b>◷ RUSH OFF / ON</b><p>OFF has no timer. ON starts a 120-second timer on your first guess.</p></article></div>
  <div class="guide-cta"><button class="btn pink" data-action="open" data-mode="classic">PLAY CLASSIC ↗</button><button class="btn lilac" data-action="faq">READ FAQ</button></div></main>`;}
function faq(){return `<main class="wrap gtp27-guide gtp27-faq" aria-labelledby="faq-title"><span class="kicker">YOUR QUESTIONS · FAST ANSWERS</span><h1 id="faq-title">FREQUENTLY <em>ASKED.</em></h1>
 <div class="faq-stack">
 ${[
  ['When does Daily reset?','At 00:00 UTC. Daily has five different Legend puzzles, one per mode.'],
  ['Does Free Play affect my leaderboard score?','No. Free Play is unlimited practice. Only completed Daily runs can be submitted.'],
  ['How does scoring work?','Correct guesses earn points. Fewer guesses, fewer hints and optional Rush time remaining give more points. A full-win daily streak adds 5% per consecutive day, capped at 50%.'],
  ['What is One Signal?','One informative trait comparison for each incorrect guess. Six attempts.'],
  ['What is Full Scan?','Six comparisons per guess, but only five guesses.'],
  ['What is Rush OFF?','No timer. With Rush ON, you have 120 seconds after your first guess.'],
  ['Is the leaderboard public?','Yes. Rankings are connected to Supabase. Public entries display nicknames and scores only. Do not use a real name or contact details.'],
  ['Why can a portrait be unavailable?','Some real Legend portraits come from third-party sources. If a source blocks access, we do not replace it with an unrelated character.'],
  ['Is this an official Apex game?','No. It is an independent fan trivia project, not endorsed by EA.']
 ].map(([q,a])=>`<details class="faq-item"><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>
 <div class="guide-cta"><button class="btn pink" data-action="home">BACK TO MODES ↗</button><button class="btn lilac" data-action="howto">HOW TO PLAY</button></div></main>`;}
function leaderboard(){
 const summary=dailySummary(store.days,today());
 const rows=boardData?.[boardTab]||[];
 const isTodayComplete=summary.completed && !sharedDay && today()===utcDay();
 return `<main class="wrap gtp27-leaderboard" aria-labelledby="rank-title"><span class="kicker">PUBLIC HALL OF FAME / TWO RANKINGS</span><h1 id="rank-title">THE <em>LEADERBOARD.</em></h1><p class="lead">Daily shows today's best hunters. Overall adds all submitted daily scores and streak bonuses.</p>
 <div class="board-switch" role="group" aria-label="Choose leaderboard"><button data-action="board-tab" data-board="daily" class="${boardTab==='daily'?'active':''}" aria-pressed="${boardTab==='daily'}">◈ DAILY · ${esc(utcDay())}</button><button data-action="board-tab" data-board="overall" class="${boardTab==='overall'?'active':''}" aria-pressed="${boardTab==='overall'}">♛ OVERALL · ALL-TIME</button></div>
 <section class="gtp27-board"><div class="board-head"><strong>${boardTab==='daily'?'TOP DAILY HUNTERS':'OVERALL LEGENDS'}</strong><small>${leaderboardConfigured()?'LIVE · PUBLIC DATABASE':'DATABASE CONNECTION PENDING'}</small></div>
 ${!leaderboardConfigured()?`<div class="board-empty"><b>RANKINGS NOT CONNECTED YET</b><p>The game owner must link a Supabase project first. The database and server validation code are included in this release.</p></div>`:boardLoading?'<div class="board-empty">LOADING THE LEADERBOARD…</div>':boardError?`<div class="board-empty">${esc(boardError)}</div>`:rows.length?`<div class="board-table">${rows.map((line,i)=>`<div class="board-row"><span>#${Number(line.position)||i+1}</span><strong>${esc(line.player_name)}</strong><b>${Number(line.score).toLocaleString('en-US')} PTS</b><small>${boardTab==='daily'?`✦ STREAK ${Number(line.streak)||0}`:`${Number(line.days_played)||0} DAYS · BEST ${Number(line.best_streak)||0}`}</small></div>`).join('')}</div>`:'<div class="board-empty">NO SCORES YET. BE THE FIRST!</div>'}</section>
 <section class="gtp27-submit"><div><span class="kicker">YOUR DAILY SCORE</span><h2>${summary.score.toLocaleString('en-US')} <small>PTS (LOCAL PREVIEW)</small></h2><p>${summary.completed?'Five daily games complete. Submit once to appear in the public rankings.':'Complete all five Daily games to submit your score. Practice rounds do not count.'}</p><small>BASE ${summary.baseScore.toLocaleString('en-US')} · STREAK BONUS ${summary.bonus.toLocaleString('en-US')} · ${summary.streak} DAY STREAK</small></div>
 <form class="board-form" id="board-submit-form"><label for="board-nickname">PUBLIC NICKNAME</label><input id="board-nickname" name="nickname" minlength="3" maxlength="18" autocomplete="nickname" pattern="[A-Za-z0-9 _-]{3,18}" placeholder="Your gamer nickname" value="${esc(savedNickname())}" ${isTodayComplete&&leaderboardConfigured()?'':'disabled'}/><button class="btn pink" type="submit" ${isTodayComplete&&leaderboardConfigured()?'':'disabled'}>SUBMIT DAILY SCORE ↗</button><small>One submission per UTC day · nickname is visible to everyone · no real names. <button class="inline-link" type="button" data-action="profile">Change nickname</button></small><p id="board-submit-feedback" class="board-submit-feedback" role="status" aria-live="polite"></p></form></section>
 <div class="guide-cta"><button class="btn lilac" data-action="home">BACK TO FIVE MODES</button><button class="btn mint" data-action="records">MY STATS ↗</button></div></main>`;
}
async function refreshBoards(){
 if(!leaderboardConfigured()||boardLoading)return;
 boardLoading=true;boardError='';
 // Keep the visible leaderboard while the request is pending.
 try{boardData=await getBoards(utcDay());}catch(error){boardError=error.message||'Connection unavailable';}
 finally{boardLoading=false;if(screen==='leaderboard')render({scroll:false});}
}
async function submitScores(){
 if(!leaderboardConfigured()){showToast('Database not configured yet');return;}
 const summary=dailySummary(store.days,today());
 if(!summary.completed||sharedDay||today()!==utcDay()){showToast('Complete all five current Daily puzzles first');return;}
 const input=document.getElementById('board-nickname');
 if(!input||!input.checkValidity()){input?.reportValidity();return;}
 const nickname=input?.value?.trim()||'';
 if(nickname)saveNickname(nickname,{close:false});
 const button=document.querySelector('#board-submit-form button[type=submit]');
 const feedback=document.getElementById('board-submit-feedback');
 if(feedback){feedback.textContent='Checking your Daily run…';feedback.dataset.status='pending';}
 if(button){button.disabled=true;button.textContent='SUBMITTING…';}
 try{
  const receipt=await submitDaily(buildSubmission(store.days,today(),nickname));
  await refreshBoards();const message=`SCORE SUBMITTED · ${receipt.totalScore} PTS · STREAK ${receipt.streak}`;showToast(message);const status=document.getElementById('board-submit-feedback');if(status){status.textContent=message;status.dataset.status='success';}
 }catch(error){const message=error.message||'Submission failed';showToast(message);if(feedback){feedback.textContent=message;feedback.dataset.status='error';}if(button){button.disabled=false;button.textContent='SUBMIT DAILY SCORE ↗';}}
}
function records(){
  const stats=streak(store.days,utcDay(),dailyModes());const days=Object.keys(store.days).sort().reverse().slice(0,14);
  return `<main class="wrap records"><span class="pill">PERSONAL ARCHIVE</span><h1>YOUR <span style="color:#ec4a95">SIGNAL.</span></h1><p class="lead">Records are stored in your browser. Global rankings require a connected database; local stats remain in this browser.</p>${statCards()}${forbiddenPanel()}<h2 class="caps" style="font-size:38px">RECENT DAYS</h2><div class="record-rows">${days.map(day=>`<div class="record-row"><span>${day}</span><span>${dayCount(store.days[day],dailyModes())}/${dailyModes().length} ${dayCount(store.days[day],dailyModes())===dailyModes().length?'✦ CLEARED':''}</span></div>`).join('')||'<p>No Daily results yet. Go start a hunt!</p>'}</div><div class="record-settings"><div><strong>ACCESSIBILITY / VISUAL EFFECTS</strong><small>Reduce background and reward animation intensity on slower devices.</small></div><button class="btn lilac small" data-action="motion">FX ${store.settings.motion?'ON':'OFF'} · CHANGE</button></div><button class="btn pink" data-action="home">BACK TO CHALLENGES ↗</button><button class="btn mint" data-action="leaderboard">♛ GLOBAL LEADERBOARD</button></main>`;
}
function wheelPool(){
 return wheelChoices(legends).filter(l=>!wheelNoRepeat||!wheelChosen||l.name!==wheelChosen.name);
}
function refreshWheelOptions(){
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
  ctx.fillStyle='#e846a0';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='900 50px Impact, sans-serif';ctx.fillText('A',0,0);
  ctx.restore();
}
function showWheel(){
  if(wheelOpen)return;
  wheelOpen=true;wheelAngle=0;wheelSpinning=false;wheelChosen=null;wheelDisplayList=null;
  const overlay=document.createElement('div');overlay.className='wheel-backdrop';overlay.id='wheel-backdrop';
  overlay.innerHTML=`<section class="wheel-modal" role="dialog" aria-modal="true" aria-label="Spin the Legend wheel">
    <header class="wheel-heading"><div><span class="kicker">CHOOSE YOUR NEXT LEGEND</span><h2>NEXT GAME <em>LEGEND.</em></h2><p>Spin to discover who to play in your next Apex match. Daily puzzles remain unaffected.</p></div><button class="btn flat small" data-action="close-wheel" aria-label="Close wheel">✕ CLOSE</button></header>
    <div class="wheel-layout"><div class="wheel-disc"><span class="wheel-arrow" aria-hidden="true">▼</span><canvas id="legend-wheel" width="600" height="600" role="img" aria-label="Colorful random-selection wheel with all 28 playable Legends"></canvas></div>
    <div class="wheel-side"><span class="wheel-stamp" id="wheel-available-count">28 AVAILABLE</span><h3>LET FATE<br><em>DECIDE.</em></h3><div class="wheel-pick" id="wheel-pick" role="status" aria-live="polite"><span class="wheel-pick-empty">Waiting for a spin…</span></div><button class="btn pink wheel-spin-button" data-action="spin" id="wheel-spin" type="button">✦ SPIN THE WHEEL</button><button class="btn lilac wheel-share-button" data-action="share-wheel" id="wheel-share" type="button" disabled>◇ COPY MY PICK</button><p class="wheel-help">Every Legend is included. No class filters or exclusions.</p><div class="wheel-settings"><label class="wheel-check"><input id="wheel-repeat" type="checkbox" ${wheelNoRepeat?'checked':''}/> Avoid immediate repeat</label></div></div></div>
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
  const label=document.getElementById('wheel-pick');if(label)label.innerHTML='<span class="wheel-pick-empty">PICKING YOUR NEXT LEGEND…</span>';
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
  app.innerHTML=nav()+(screen==='home'?home():screen==='game'?game():screen==='records'?records():screen==='howto'?howTo():screen==='faq'?faq():leaderboard());
  loadPortraitImages();
  loadAbilityImages();
  if(scroll)window.scrollTo({top:0,behavior:'instant'});
  if(screen==='game'&&!getRound()?.finished)updateSearchResults();
  if(pickerOpen)renderPicker();
  if(!identityPromptOpen&&!savedNickname()&&!store.profile?.askedName)openIdentityPrompt();
}

function openMode(mode,playSession=session){
  if(!MODES.includes(mode))return;
  active=mode;session=playSession;screen='game';pickerOpen=false;quickSearch='';ensureRound();render();sound('nav');
}
function submitGuess(name){
  const round=getRound();if(!round||round.finished)return;
  const next=tryGuess(round,name,legends);
  if(next===round)return;
  const wasWon=round.won;setRound(next);
  const justWon=next.won&&!wasWon;
  if(justWon){
    store.history.wins=(store.history.wins||0)+1;
    store.history.bestScore=Math.max(store.history.bestScore||0,gameScore(next));sync();
  } else {sound(next.signals.at(-1)?.kind==='correct'?'clue':'wrong');if(next.finished)sound('lose');}
  pickerOpen=false;quickSearch='';render({scroll:false});
  if(justWon){sound('party');if(store.settings.motion&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches)triggerVictoryConfetti();}
}
function triggerVictoryConfetti(){
  document.querySelector('.gtp212-confetti')?.remove();
  const layer=document.createElement('div');layer.className='gtp212-confetti';
  layer.setAttribute('aria-hidden','true');
  const palette=['#ff7dba','#ab9cff','#82eadc','#f9c56c','#fdf4ff'];
  for(let i=0;i<72;i++){
    const bit=document.createElement('i');
    bit.style.setProperty('--left',`${(i*47+17)%100}%`);
    bit.style.setProperty('--delay',`${((i*37)%100)/140}s`);
    bit.style.setProperty('--time',`${2.35+(i%7)*.16}s`);
    bit.style.setProperty('--twist',`${i%2===0?720:-540}deg`);
    bit.style.setProperty('--drift',`${((i*31)%190)-95}px`);
    bit.style.background=palette[i%palette.length];
    layer.appendChild(bit);
  }
  app.appendChild(layer);
  setTimeout(()=>layer.remove(),4400);
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
  screen='leaderboard';pickerOpen=false;render();void refreshBoards();sound('nav');
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
  else if(action==='wheel')showWheel();
  else if(action==='close-wheel')closeWheel();
  else if(action==='spin')spinWheel();
  else if(action==='share-wheel')void copyWheelPick();
  else if(action==='home'){screen='home';pickerOpen=false;render();sound('nav');}
  else if(action==='records'){screen='records';pickerOpen=false;render();sound('nav');}
  else if(action==='howto'){screen='howto';pickerOpen=false;render();sound('nav');}
  else if(action==='faq'){screen='faq';pickerOpen=false;render();sound('nav');}
  else if(action==='leaderboard'){screen='leaderboard';pickerOpen=false;render();void refreshBoards();sound('nav');}
  else if(action==='scroll-extras'){document.getElementById('home-extras')?.scrollIntoView({behavior:store.settings.motion?'smooth':'instant'});}
  else if(action==='board-tab'){boardTab=button.dataset.board;render({scroll:false});if(!boardData)void refreshBoards();}
  else if(action==='open'){openMode(button.dataset.mode);}
  else if(action==='home-daily'){
    session='daily';const next=dailyModes().find(mode=>!store.days[today()]?.[mode]?.finished);
    if(next)openMode(next,'daily');else{screen='leaderboard';render();void refreshBoards();}
  }
  else if(action==='session'){
    if(session===button.dataset.session)return;
    session=button.dataset.session;
    // Update only the changed controls: no hero/backdrop DOM replacement or flash.
    document.querySelectorAll('[data-action=session]').forEach(el=>{el.classList.toggle('active',el.dataset.session===session);el.setAttribute('aria-pressed',String(el.dataset.session===session));});
    const label=document.querySelector('.gtp27-session-picker>span');if(label)label.textContent=session==='daily'?'ONE SCORE PER DAY':'UNLIMITED PRACTICE';
    const footer=document.querySelector('.gtp28-hero-footer');
    const done=dailyModes().filter(mode=>store.days[today()]?.[mode]?.finished).length;
    if(footer){footer.querySelector('.gtp28-daily-progress>span:last-child').textContent=`FIVE MODES · ${session==='daily'?`${done}/5 DAILY CLEARED`:'PRACTICE MODE'}`;
      footer.querySelector('.gtp28-primary-row').innerHTML=session==='daily'?`<button data-action="home-daily" class="gtp2-primary gtp28-play-btn">${done===5?'✦ VIEW YOUR DAILY SCORE':'◈ CONTINUE DAILY'} <span>↗</span></button>`:`<button data-action="open" data-mode="classic" class="gtp2-primary gtp28-play-btn">∞ START FREE PLAY <span>↗</span></button>`;}
    document.querySelectorAll('.gtp2-mode-card').forEach(el=>{const m=el.dataset.mode;const round=session==='daily'?store.days[today()]?.[m]:store.practice[m];el.classList.toggle('finished',Boolean(session==='daily'&&round?.finished));const status=el.querySelector('.gtp2-mode-copy em');if(status)status.textContent=session==='daily'&&round?.finished?(round.won?'✓ CLEARED':'✓ COMPLETED'):'PLAY NOW ↗';});
    sound('nav');
  }
  else if(action==='profile'){openIdentityPrompt(true);sound('pick');}
  else if(action==='identity-skip'){closeIdentityPrompt();}
  else if(action==='audio'){store.settings.audio=!store.settings.audio;sync();button.textContent=store.settings.audio?'♫ FX ON':'♪ FX OFF';button.setAttribute('aria-pressed',String(store.settings.audio));if(store.settings.audio)sound('pick');}
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
    const changed=action==='style'?{...round,mode:button.dataset.style}:{...round,timeLimit:round.timeLimit?0:120};
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
app.addEventListener('submit',event=>{
  if(event.target.id==='board-submit-form'){event.preventDefault();void submitScores();return;}
  if(event.target.id==='identity-form'){event.preventDefault();const form=new FormData(event.target);const nickname=String(form.get('nickname')||'').trim().replace(/\s+/g,' ');const input=document.getElementById('identity-name');if(!input?.checkValidity()){input?.reportValidity();return;}saveNickname(nickname);render({scroll:false});showToast(`Nickname saved: ${nickname}`);}
});
app.addEventListener('input',event=>{
  if(event.target.id==='guess-search'){quickSearch=event.target.value;updateSearchResults();}
  if(event.target.id==='picker-search'){pickerSearch=event.target.value;renderPickerResults();}
  if(event.target.id==='board-nickname'){store.profile={...(store.profile||{}),nickname:event.target.value};sync();}
  if(event.target.id==='picker-sort'){pickerSort=event.target.value;renderPickerResults();}
});
app.addEventListener('change',event=>{
  if(event.target.id==='wheel-repeat'&&!wheelSpinning){wheelNoRepeat=event.target.checked;refreshWheelOptions();}
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
  const expired=expireRound(round,Date.now());
  if(expired!==round){setRound(expired);sound('lose');render({scroll:false});return;}
  const timer=document.getElementById('round-timer');if(timer){const time=remainingTime(round);timer.querySelector('span').textContent=`${time}s`;timer.classList.toggle('urgent',time<=25&&!round.finished);}
},500);
render();


