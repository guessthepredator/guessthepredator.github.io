import {TIPS,unlockedIntel,tipFor} from './tips.mjs?v=2.37.0';
import {legends} from './data.mjs?v=2.37.0';
import {artCatalog,portraitSourcesFor} from './art.mjs?v=2.37.0';
import {localPortraitFiles} from './portrait_media_manifest.mjs?v=2.37.0';
import {abilityCandidates,localAbilitySlugs} from './abilities.mjs?v=2.37.0';
import {dailySpotlight,wheelChoices,wheelPick,destinationRotation} from './spotlight.mjs?v=2.37.0';
import {playSound} from './audio.mjs?v=2.37.0';
import {paintPixelScene} from './pixel_scene.mjs?v=2.37.0';
import {getBoards, submitDaily, triviaRequest, getTriviaBoards, leaderboardConfigured} from './leaderboard.mjs?v=2.37.0';
import {dailySummary, buildSubmission} from './scoring.mjs?v=2.37.0';
import {DAILY_TRACKS,dailySchedule,dailyAnswers,currentDailyRounds,checkpointCount,dailyStats,rewardFor,intelFor} from './daily218.mjs?v=2.37.0';
import {loadStore,saveStore} from './store.mjs?v=2.37.0';
import {FIELDS,LABELS,MODES,MODE_NAMES,CLASS_NAMES,MAX_GUESSES,MAX_HINTS,maxGuesses,utcDay,puzzleAnswers,newRound,tryGuess,expireRound,
  getHint,availableHintFields,formatValue,gameScore,gameRank,scannerState,scannerDisplayValue,filteredRoster,remainingTime,dayCount,streak,legendByName} from './engine.mjs?v=2.37.0';

const app=document.getElementById('app');
let store=loadStore();
const SAVED_BOARD_KEY='gtp:boards:last-good:v1';
let boardCacheDay=utcDay();
const dailyModes=()=>DAILY_TRACKS;
let screen='home';
let triviaRun=null;
const triviaDailyRewardKey=day=>'gtp-trivia-daily-complete:'+day;
function triviaRewardEarned(){try{return localStorage.getItem(triviaDailyRewardKey(today()))==='yes';}catch{return false;}}
function saveTriviaReward(run){if(run?.finished&&run.mode==='daily'){try{localStorage.setItem(triviaDailyRewardKey(today()),'yes');}catch{}}}
function totalIntelCheckpoints(){return checkpointCount(store.days,today())+Number(triviaRewardEarned());}
function intelState(checkpoint){
  const unlocked=checkpoint===3?triviaRewardEarned():checkpointCount(store.days,today())>=checkpoint;
  const read=Boolean(store.intelOpenedDays?.[`${today()}:${checkpoint}`]||(checkpoint===2&&store.intelOpenedDays?.[today()]===true));
  return {unlocked,read};
}
function intelReadyMarkup(checkpoint){
  const {unlocked,read}=intelState(checkpoint);
  if(!unlocked)return '';
  return `<aside class="gtp223-intel-ready ${read?'is-read':'is-new'}" role="status"><div><b>${read?'✓ INTEL ALREADY DECLASSIFIED':'✦ NEW FORBIDDEN INTEL UNLOCKED'}</b><small>${read?'You can read today’s tip again.':'Checkpoint '+checkpoint+' is available. Open the chest for your Apex tip.'}</small></div><button type="button" class="btn mint" data-action="intel-open" data-checkpoint="${checkpoint}">${read?'REVIEW INTEL ↗':'OPEN YOUR INTEL ↗'}</button></aside>`;
}

let triviaMode='daily';
let triviaBusy=false;
let triviaMessage='';
let triviaScoreTab='daily';
let triviaBoard=null;
let triviaBoardBusy=false;
let triviaBoardError='';
let triviaSubmitting=false;
let triviaAnswerText='';
let triviaTickTimer=null;
let triviaClockFrame=0;
let triviaExpiredKey='';

let session='daily';
let active='classic';
let dailyTrack='full';
let intelCheckpoint=1;
let boardTab='daily';
let boardData=(()=>{try{const d=JSON.parse(localStorage.getItem('gtp:boards:last-good:v1')||'null');return d?.boards?{daily:d.day===utcDay()?d.boards.daily:[],overall:d.boards.overall||[]}:null;}catch{return null}})();
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
const COLORS={classic:'#f17b72',pixel:'#5ad7f1',quote:'#ffca75',ability:'#ba9eff',emoji:'#73dfc2'};
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
const sound=name=>playSound(name,store.settings.audio,store.settings.volume);
const sync=()=>saveStore(store);
const savedNickname=()=>String(store.profile?.nickname||'').trim();
const getRound=()=>session==='daily'?currentDailyRounds(store.days,today())[dailyTrack]:store.practice[active];
function setRound(round){
  if(session==='daily') {const day=store.days[today()]||{};store.days[today()]={...day,daily218:{...(day.daily218||{}),[dailyTrack]:round}};}
  else store.practice[active]=round;
  sync();
}
function ensureRound(mode=active,playSession=session){
 if(playSession==='daily'){
  const schedule=dailySchedule(today()),key=dailyTrack;
  mode=schedule[key];active=mode;
  const entry=store.days[today()]||{};
  let round=entry.daily218?.[key];
  if(!round){round=newRound(dailyAnswers(today(),legends)[key],key,0);
   store.days[today()]={...entry,daily218:{...(entry.daily218||{}),[key]:round}};sync();}
  return round;
 }
 let round=store.practice[mode];
 if(round){
  if(mode==='ability'&&!round.finished&&!round.guesses?.length){
   const target=legendByName(legends,round.answer);
   if(!target||!localAbilitySlugs.includes(target.slug)){
    round=newRound(answers().ability,round.mode,round.timeLimit);store.practice[mode]=round;sync();
   }
  }
  if(round.mode==='full'&&!round.finished&&round.guesses?.length>=5){
   round={...round,finished:true,won:false,loss:'attempts',finishedAt:Date.now()};store.practice[mode]=round;sync();
  }
  return round;
 }
 const eligible=mode==='ability'?legends.filter(l=>localAbilitySlugs.includes(l.slug)):legends;
 round=newRound(eligible[Math.floor(Math.random()*eligible.length)].name,store.settings.playStyle,store.settings.rush?120:0);
 store.practice[mode]=round;sync();return round;
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
    const slug=image.dataset.portrait;const localFile=localPortraitFiles[slug];
    const inPixelPuzzle=Boolean(image.closest('.pixel-art'));
    const sourceCatalog=portraitSourcesFor(slug,{pixel:inPixelPuzzle});
    // Pixel mode uses the old source priority so tall renders never change its canvas composition.
    const candidates=[...(localFile?[`./assets/portraits/${localFile}`]:[]),...sourceCatalog];let index=0;
    const next=()=>{
      if(index>=candidates.length){
        const box=image.closest('.portrait-holder');
        const px=box?.closest('.pixel-art');
        if(px){const status=px.querySelector('.pixel-error');if(status)status.textContent='IMAGE SOURCE UNAVAILABLE · USE BACKUP INTEL';}
        if(box){const name=image.dataset.portrait||'?';const initial=(name[0]||'?').toUpperCase();box.innerHTML='<span class="portrait-unavailable" aria-label="Image unavailable"><b>'+initial+'</b><small>VISUAL SIGNAL<br>UNAVAILABLE</small></span>';}
        return;
      }
      const candidate=candidates[index++];
      const isIconFallback=candidate.includes('moeneri/astrbot_plugin_apexrankwatch/');
       const isRender=!isIconFallback&&(candidate.includes('Original%20')||candidate.startsWith('./assets/portraits/'));
       image.closest('.portrait-holder')?.classList.toggle('portrait-icon-fallback',isIconFallback);
      image.dataset.portraitSource=candidate.startsWith('./assets/portraits/')?'local':isRender?'model-render':'remote';
      image.closest('.portrait-holder')?.classList.toggle('portrait-model-render',isRender);
      image.src=candidate;
    };
    image.addEventListener('error',next);
    image.addEventListener('load',()=>{
      if(image.naturalWidth<80||image.naturalHeight<80||((inPixelPuzzle||image.closest('.gtp2-picker'))&&image.naturalWidth>image.naturalHeight*1.2)){next();return;}
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
  <button class="brand gtp2-brand gtp221-unified-brand" data-action="home" aria-label="Guess the Predator home"><span class="gtp219-logo-emblem" aria-hidden="true"><svg viewBox="0 0 64 72" width="38" height="44" fill="none"><path d="M32 3 61 64H44L31 30 20 64H3L32 3Z" fill="currentColor"/><path d="M23 51h19l5 11H18l5-11Z" fill="#071222"/></svg></span><span class="gtp219-brand-type">GUESS THE<strong>PREDATOR</strong></span></button>
  <nav class="topnav" aria-label="Main navigation"><button class="nav-item ${screen==='home'?'active':''}" data-action="home">⌂ HOME</button><button class="nav-item ${screen==='trivia'?'active':''}" data-action="trivia">✦ TRIVIA</button><button class="nav-item ${screen==='game'?'active':''}" data-action="open" data-mode="classic">◈ PLAY</button><button class="nav-item ${screen==='leaderboard'?'active':''}" data-action="leaderboard">♛ RANKINGS</button><button class="nav-item ${screen==='records'?'active':''}" data-action="records">▤ STATS</button><button class="nav-item ${screen==='howto'?'active':''}" data-action="howto">? HOW TO PLAY</button><button class="nav-item ${screen==='faq'?'active':''}" data-action="faq">◉ FAQ</button></nav>
  <details class="gtp213-mobile-menu"><summary aria-label="Open site navigation">☰</summary><div class="gtp213-mobile-links"><button data-action="home" type="button">⌂ HOME</button><button data-action="trivia" type="button">✦ TRIVIA</button><button data-action="open" data-mode="classic" type="button">◈ PLAY</button><button data-action="leaderboard" type="button">♛ RANKINGS</button><button data-action="records" type="button">▤ STATS</button><button data-action="howto" type="button">? HOW TO PLAY</button><button data-action="faq" type="button">◉ FAQ</button></div></details>
  <div class="top-actions"><button class="switch gtp237-settings-switch" type="button" data-action="settings">⚙ SETTINGS</button><button class="switch gtp2-profile-switch" data-action="profile" aria-label="Choose nickname">${nick?`◉ ${esc(nick)}`:'◎ NICKNAME'}</button><button class="switch gtp2-sound-switch" data-action="audio" aria-label="Toggle sound" aria-pressed="${store.settings.audio}">${store.settings.audio?'♫ FX ON':'♪ FX OFF'}</button></div>
 </div></header>`;}
function settingsDialog(){
 const layer=document.createElement('div');layer.id='gtp237-settings';layer.className='gtp237-settings-backdrop';
 layer.innerHTML=`<div class="gtp237-settings-panel" role="dialog" aria-modal="true" aria-label="Game settings"><div class="gtp237-settings-head"><div><span>OUTLANDS CONTROL PANEL</span><h2>SETTINGS</h2></div><button type="button" data-action="settings-close" aria-label="Close settings">✕</button></div><label for="gtp237-volume">MASTER FX VOLUME <output id="gtp237-volume-output">${Math.round((store.settings.volume??.7)*100)}%</output></label><input id="gtp237-volume" type="range" min="0" max="100" step="1" value="${Math.round((store.settings.volume??.7)*100)}" aria-label="Sound effects volume"/><div class="gtp237-settings-actions"><button type="button" data-action="audio">SOUND ${store.settings.audio?'ON':'OFF'}</button><button type="button" data-action="motion">ANIMATIONS ${store.settings.motion?'ON':'OFF'}</button><button type="button" data-action="sound-preview">TEST SOUND ✦</button></div><small>Preferences saved automatically.</small></div>`;
 layer.addEventListener('click',e=>{if(e.target===layer)layer.remove()});app.appendChild(layer);layer.querySelector('[data-action="settings-close"]')?.focus();
}
function statCards(){
  const day=currentDailyRounds(store.days,today());const stats=dailyStats(store.days,utcDay());
  return `<section class="dash" aria-label="Player statistics">
    <div class="stat"><label>DAILY SIGNALS</label><strong>${DAILY_TRACKS.filter(t=>day[t]?.finished).length}<small> / ${dailyModes().length}</small></strong><small>Playable puzzles</small></div>
    <div class="stat"><label>CURRENT STREAK</label><strong>${stats.current}</strong><small>Full Daily clears</small></div>
    <div class="stat"><label>PERSONAL BEST</label><strong>${store.history.bestScore||0}</strong><small>Highest round score</small></div>
    <div class="stat"><label>TOTAL WINS</label><strong>${store.history.wins||0}</strong><small>Saved on this browser · across both sessions</small></div>
  </section>`;
}
function forbiddenPanel(){
 const done=totalIntelCheckpoints();
 return `<section class="vault-showcase gtp218-record-rewards"><div class="vault-intro"><span class="kicker">✦ FORBIDDEN INTEL / THREE CHECKPOINTS</span><h2>UNLOCK YOUR <em>INTEL.</em></h2><p>Finish Full Scan, One Signal, and Daily Trivia to unlock all three rewards.</p><div class="vault-track"><span style="width:${done/3*100}%"></span></div><strong>${done}/3 CHECKPOINTS COMPLETE</strong><div class="gtp218-reward-actions">${[1,2,3].map(n=>`<button class="btn mint" data-action="intel-open" data-checkpoint="${n}" ${(n===3?triviaRewardEarned():done>=n)?'':'disabled'}>${intelState(n).unlocked?(intelState(n).read?`✓ CHECKPOINT ${n} · READ`:`✦ CHECKPOINT ${n} · NEW`):`CHECKPOINT ${n} LOCKED`}</button>`).join('')}</div></div></section>`;
}
function intelDialog(){
  const tip=intelFor(today(),intelCheckpoint);
  const dialog=document.createElement('div');dialog.className='intel-backdrop';dialog.id='intel-dialog';dialog.setAttribute('role','presentation');
  dialog.innerHTML=`<div class="intel-modal" role="dialog" aria-modal="true" aria-label="Forbidden Intel reward"><button class="intel-close" data-action="intel-close" type="button" aria-label="Close reward">✕</button>
      <div class="intel-reveal-scene"><span class="reward-spark s1">✦</span><span class="reward-spark s2">✧</span><span class="reward-spark s3">✦</span><span class="reward-spark s4">✧</span>
      <div class="reward-chest"><div class="reward-lid">◆</div><div class="reward-base">✦</div></div>
      <div class="gold-paper"><div class="paper-stamp">✦ OUTLANDS / DAILY REWARD ✦</div><h2>${intelCheckpoint===1?'FIELD<br>INTEL':intelCheckpoint===2?'RARE<br>INTEL':'TRIVIA<br>INTEL'}</h2><span class="paper-legend">CHECKPOINT ${intelCheckpoint} · ${esc(tip.category)}</span><p><strong class="gtp223-intel-title">${esc(tip.title)}</strong> ${esc(tip.tip)}</p><a class="gtp223-intel-source" href="${esc(tip.source)}" target="_blank" rel="noopener noreferrer">VERIFIED EA GUIDE ↗</a><small>INTEL DECLASSIFIED · ${esc(today())}</small></div>
      <span class="reveal-boozle">BAMBOOZLED! ✦</span></div><div class="intel-dialog-footer"><button class="btn mint" data-action="intel-close" type="button">TAKE THE INTEL ✓</button></div></div>`;
  dialog.addEventListener('click',ev=>{if(ev.target===dialog){closeIntelDialog();render({scroll:false});}});
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
function homeIntelPanel(){
 const rounds=store.days[today()]||{};
 const complete=dailyModes().filter(mode=>rounds[mode]?.finished).length;
 const total=dailyModes().length;
 const unlocked=unlockedIntel(rounds,dailyModes());
 const claimed=Boolean(store.intelOpenedDays?.[today()]);
 return `<article class="gtp214-intel-center gtp215-intel-feature" aria-label="Forbidden Intel daily reward">
   <div class="gtp215-intel-art" aria-hidden="true"><div class="vault-chest"><div class="vault-lid"><span>◆</span></div><div class="vault-box"><span>✦</span></div></div></div>
   <div class="gtp215-intel-details">
     <span class="gtp214-intel-kicker">✧ DAILY REWARD / ${complete} OF ${total}</span>
     <h2>FORBIDDEN <em>INTEL.</em></h2>
     <div class="gtp214-intel-track" role="progressbar" aria-valuenow="${complete}" aria-valuemin="0" aria-valuemax="${total}" aria-label="Daily challenges completed"><span style="width:${complete/total*100}%"></span></div>
     <p>${complete}/${total} MISSIONS COMPLETE</p>
     <button type="button" data-action="intel-open" ${unlocked?'':'disabled'}>${unlocked?(claimed?'✦ VIEW TODAY’S INTEL':'✦ REVEAL YOUR INTEL'):'◆ COMPLETE ALL FIVE TO UNLOCK'}</button>
   </div>
 </article>`;
}
function homeFeatureDock(){
 const legend=dailySpotlight(utcDay(),legends);
 return `<section class="gtp213-dock gtp214-dock" aria-label="Next game and Legend of the day">
  <button class="gtp213-dock-card gtp213-dock-wheel gtp216-wheel-hitbox" type="button" data-action="wheel" aria-label="Spin the wheel to pick your next game Legend"><span class="gtp213-dock-kicker">◈ PLAY SOMETHING DIFFERENT</span><span class="gtp213-dock-main"><span class="gtp213-dock-icon gtp216-wheel-graphic" aria-hidden="true"><span class="gtp216-wheel-dial"></span></span><span class="gtp216-wheel-copy"><strong class="gtp216-wheel-title">NEXT GAME <em>LEGEND.</em></strong><span class="gtp216-wheel-descript">Spin for a random Legend to play next.</span></span></span><span class="gtp216-wheel-cta">✦ SPIN THE WHEEL <span aria-hidden="true">↗</span></span></button>
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
 const rounds=currentDailyRounds(store.days,today());
 const done=checkpointCount(store.days,today());
 const intelDone=totalIntelCheckpoints();
 const spotlight=dailySpotlight(utcDay(),legends),scheduled=dailySchedule(today());
 const freeSelected=session==='unlimited';
 const dailyStatus=rounds.full?.finished?(rounds.signal?.finished?'BOTH DAILY CHALLENGES COMPLETE':`02 · ONE SIGNAL ${rounds.signal?.guesses?.length?'RESUME ('+rounds.signal.guesses.length+' GUESSES)':'UNLOCKED'}`):`01 · FULL SCAN ${rounds.full?.guesses?.length?'RESUME ('+rounds.full.guesses.length+' GUESSES)':'READY'}`;
 const cards=[
   ['classic','CLASSIC','Find the mystery Legend.','⌕'],
   ['pixel','PIXEL','See through the blur.','▦'],
   ['quote','QUOTE','Identify the voice line.','❞'],
   ['ability','ABILITY','Read the ability symbol.','◈'],
   ['emoji','EMOJI','Five symbols. One Legend.','✦'],
   ['trivia','TRIVIA','Five questions · 20 seconds each.','✧']
 ];
 const card=([mode,title,description,glyph],i)=>`<button type="button" class="gtp222-orbit-card gtp222-card-${mode} gtp224-orbit-${i+1}" data-action="${mode==='trivia'?'trivia':'open'}" ${mode==='trivia'?'':`data-mode="${mode}" data-session="unlimited"`} aria-label="${mode==='trivia'?'Open Trivia':'Play '+title}"><span class="gtp222-orbit-symbol" aria-hidden="true">${glyph}</span><span class="gtp222-orbit-copy"><strong>${title}</strong><small>${description}</small></span><span class="gtp222-orbit-arrow" aria-hidden="true">↗</span></button>`;
 return `<main class="gtp219-home gtp222-home" aria-label="Guess the Predator homepage">
  <div class="gtp219-backdrop" aria-hidden="true"></div>
  <div class="gtp222-layout">
   <div class="gtp222-eyebrow">✦ SIX WAYS TO PLAY · ONE OUTLANDS MYSTERY · DAILY PROGRESS SAVED ON THIS DEVICE ✦</div>
   <div class="gtp222-arena" aria-label="Choose a game mode or claim daily rewards">
      <section class="gtp222-side gtp222-side-left" aria-label="Classic, Pixel and Quote">
        ${cards.slice(0,3).map(card).join('')}
      </section>
      <section class="gtp222-core" aria-label="Forbidden Intel and daily challenges">
        <div class="gtp237-mythic-scene" role="img" aria-label="Glowing mythic supply bin"><div class="gtp237-mythic-halo"></div><div class="gtp237-mythic-bin"><div class="gtp237-mythic-lid"><i></i><b>MYTHIC</b><i></i></div><div class="gtp237-mythic-body"><span>◭</span><strong>SUPPLY BIN</strong></div><div class="gtp237-mythic-base"></div></div><span class="gtp237-mythic-glint">✦</span></div>
        <h1>FORBIDDEN <em>INTEL</em></h1>
        <div class="gtp219-intel gtp222-intel"><div class="gtp219-intel-head"><strong>THREE DAILY REWARDS</strong><b>${intelDone} / 3</b></div>
          <div class="gtp219-progress" aria-label="${intelDone} of 3 rewards unlocked" role="progressbar" aria-valuenow="${intelDone}" aria-valuemin="0" aria-valuemax="3"><span class="${done>=1?'cleared':''}"></span><span class="${done>=2?'cleared':''}"></span><span class="${triviaRewardEarned()?'cleared':''}"></span></div>
          <div class="gtp219-rewards">${[1,2,3].map(n=>{const {unlocked,read}=intelState(n);return `<button type="button" class="${unlocked?(read?'gtp223-read':'gtp223-new'):''}" data-action="intel-open" data-checkpoint="${n}" ${unlocked?'':'disabled'}><span>${unlocked?(read?'✓':'✦'):'◇'} ${n===1?'FULL SCAN':n===2?'ONE SIGNAL':'DAILY TRIVIA'}</span><small>${unlocked?(read?'READ ✓':'NEW · OPEN ↗'):'LOCKED'}</small></button>`}).join('')}</div>
        </div>
        <div class="gtp222-primary-actions"><button data-action="home-daily" type="button" class="gtp219-daily-btn"><strong>▦ DAILY CHALLENGE</strong><small>${dailyStatus} · ${MODE_NAMES[rounds.full?.finished?scheduled.signal:scheduled.full]}</small></button>
        <button data-action="session" data-session="unlimited" type="button" class="gtp219-free-btn"><strong>✧ FREE PLAY</strong><small>Unlimited practice · all five modes</small></button></div>
      </section>
      <section class="gtp222-side gtp222-side-right" aria-label="Ability, Emoji and Trivia">
        ${cards.slice(3).map(card).join('')}
      </section>
   </div>
   <div class="gtp222-home-dock"><button type="button" data-action="wheel" class="gtp222-wheel" aria-label="Spin the full Next Game Legend wheel"><span class="gtp222-wheel-illustration" aria-hidden="true"></span><span class="gtp222-dock-copy"><strong>NEXT GAME LEGEND</strong><small>Spin for a random Legend · whole panel clickable</small></span><b aria-hidden="true">↗</b></button>
    <article class="gtp222-spotlight"><div class="gtp222-spotlight-art">${portrait(spotlight.slug,{alt:spotlight.name,cls:'balanced',eager:true})}</div><div class="gtp222-dock-copy"><strong>LEGEND OF THE DAY</strong><b>${esc(spotlight.name)}</b><small>${esc(spotlight.role)} · changes daily</small></div></article></div>
   <footer class="gtp219-footer">♥ Made by Sebyby <span>Independent fan trivia · Not affiliated with EA or Respawn</span></footer>
  </div>
 </main>`;
}
function homeLegacy(){
 return `<main class="gtp2-home">
  <section class="gtp2-hero nova27-home" aria-label="Guess the Predator — five game modes">
   <img id="gtp2-backdrop" class="gtp2-backdrop" src="./assets/decor/haunted-hero.webp" alt="" aria-hidden="true" fetchpriority="high"/>
   <div class="gtp216-center-clear" aria-hidden="true"></div>
   <div class="gtp216-mirage-duo" aria-hidden="true"><span class="gtp216-mirage gtp216-mirage-left"></span><span class="gtp216-mirage gtp216-mirage-right"></span></div>
   <div class="gtp2-vignette" aria-hidden="true"></div>
   <div class="gtp2-hero-content">
     <div class="gtp214-hero-intro"><span>✦ FIVE MISSIONS · ONE MYSTERY</span><p>Pick your challenge. Follow the clues.</p></div>
     ${homeIntelPanel()}
     <div class="gtp2-switchline gtp27-session-picker"><div class="gtp2-session" role="group" aria-label="Play type"><button data-action="session" data-session="daily" class="${session==='daily'?'active':''}" aria-pressed="${session==='daily'}">◈ DAILY CHALLENGE</button><button data-action="session" data-session="unlimited" class="${session==='unlimited'?'active':''}" aria-pressed="${session==='unlimited'}">∞ FREE PLAY</button></div></div>
     <div class="gtp212-cascade" aria-label="Five playable daily modes">
       ${['classic','pixel','quote','ability','emoji'].map((mode,i)=>`<div class="gtp212-step gtp212-step-${mode}">${modeTile(mode,i)}</div>`).join('')}
     </div>
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
  return `<div class="clue-visual gtp27-mystery gtp29-classic-visual gtp229-mystery-visual"><div class="gtp229-mystery-stage"><img class="gtp229-unknown-portrait" src="./assets/decor/unknown-legend.svg" alt="Unknown Legend: an armored silhouette with a glowing question mark" width="680" height="760" loading="eager" decoding="async"/><span class="gtp229-classified-stamp" aria-hidden="true">IDENTITY CLASSIFIED</span></div><div class="mystery-wording"><small>01 · UNKNOWN LEGEND</small><strong>WHO'S THAT LEGEND?</strong><span>Compare clues to uncover the identity.</span></div></div>`;
}
function modeRail(){return `<nav class="mode-rail" aria-label="Switch game mode">${MODES.map(mode=>`<button class="mode-tab ${active===mode?'active':''} ${session==='daily'&&Object.values(currentDailyRounds(store.days,today())).some(r=>r?.won&&r.answer===answers()[mode])?'done':''}" style="--tile:${classOf(mode)}" data-action="open" data-mode="${mode}" ><b>${ICONS[mode]}</b><span>${MODE_NAMES[mode]}</span></button>`).join('')}</nav>`;}
function styleStrip(round){
  const locked=session==='daily'||round.guesses.length>0||round.finished;
  return `<div class="style-strip" aria-label="Round rules">
    <div><strong>${session==='daily'?'DAILY SCAN · RULES LOCKED':'CHOOSE YOUR SCAN'}</strong><div class="style-description">${round.mode==='signal'?'MYSTERY: one trait comparison per guess':'FULL SCAN: reveal all six traits'}</div></div>
    <div class="style-options" role="group" aria-label="Choose feedback"><button class="segment ${round.mode==='signal'?'active':''}" data-action="style" data-style="signal" ${locked?'disabled':''}>✦ ONE SIGNAL</button><button class="segment ${round.mode==='full'?'active':''}" data-action="style" data-style="full" ${locked?'disabled':''}>▦ FULL SCAN</button><button class="segment rush-btn ${round.timeLimit?'active':''}" data-action="rush" ${locked?'disabled':''}>⌛ RUSH ${round.timeLimit?round.timeLimit+'s':'OFF'}</button></div>
  </div>`;
}
function latestSignal(round,target){
  if(!round.guesses.length)return `<div class="flash idle"><span class="signal-mark">✧</span><span><strong>AWAITING YOUR FIRST GUESS</strong><small>Your next guess will reveal ${round.mode==='signal'?'one of the six traits':'all six traits'}.</small></span></div>`;
  if(round.mode==='full')return `<div class="flash idle"><span class="signal-mark">▦</span><span><strong>LATEST FULL SCAN RECEIVED</strong><small>The board displays this guess only. Red means mismatch, green means match.</small></span></div>`;
  const s=round.signals.at(-1);
  if(!s)return `<div class="flash idle"><span class="signal-mark">⌁</span><span><strong>NO NEW SIGNAL</strong><small>All remaining comparable fields were already revealed.</small></span></div>`;
  const correct=s.kind==='correct';
  return `<div class="flash intel-neutral" role="status"><span class="signal-mark">⌁</span><span><strong>${esc(s.guess)} · ${LABELS[s.field]} ${correct?'TRAIT MATCH':'TRAIT DIFFERENCE'}${s.direction?s.direction>0?' ↑':' ↓':''}</strong><small>${esc(s.value)} ${s.direction?(s.direction>0?'· Target has a higher value':'· Target has a lower value'):correct?'· Only this trait matches — target not found':'· Keep investigating'} · NOT A WIN</small></span></div>`;
}
function scannerMarkup(round,target){
  if(!round.guesses.length)return `<section class="gtp229-scan-preview" aria-label="Identity scanner waiting for guesses"><span class="gtp229-step">03 · IDENTITY SCANNER</span><strong>SCAN READY · AWAITING GUESS</strong><small>Make a guess to compare traits. Green = MATCH, red = DIFFERENT.</small></section>`;
  const scanner=scannerState(round,target,legends);
  const lastField=round.signals.at(-1)?.field;
  const verified=FIELDS.filter(field=>scanner[field]?.kind==='correct'||scanner[field]?.kind==='hint');
  const chips=verified.map(field=>`<span class="gtp222-locked-chip"><b>✓ ${LABELS[field]}</b> ${esc(scanner[field].value)}</span>`).join('');
  const cells=FIELDS.map(field=>{
    const signal=scanner[field];const kind=signal.kind;
    const css=kind==='correct'?'good':kind==='wrong'?'bad':kind==='hint'?'hinted':kind==='unknown'?'unknown':'';
    const direction=signal.direction>0?'↑':signal.direction<0?'↓':'';
    return `<div class="scan-cell ${css} ${field===lastField?'new':''}" data-scan-kind="${kind}" title="${LABELS[field]}" aria-label="${LABELS[field]}: ${kind==='wrong'?'does not match':kind==='correct'?'matches':kind}"><small>${LABELS[field]}</small><strong>${kind==='unknown'?'UNKNOWN':kind==='hidden'?'—':esc(signal.value)}${direction?' '+direction:''}</strong><span>${kind==='correct'?'✓ MATCH':kind==='wrong'?'✕ WRONG · DIFFERENT':kind==='hint'?'✓ HINT MATCH':kind==='unknown'?'UNKNOWN':'—'}</span></div>`;
  }).join('');
  const matches=FIELDS.filter(field=>scanner[field]?.kind==='correct'||scanner[field]?.kind==='hint').length;
  const misses=FIELDS.filter(field=>scanner[field]?.kind==='wrong').length;
  const remaining=availableHintFields(round,target,legends);
  const disabled=round.finished||round.guesses.length===0||round.hints.length>=MAX_HINTS||remaining.length===0;
  return `<div class="scanner-head gtp226-scanner-head"><div><strong>◈ IDENTITY SIGNAL BOARD</strong><small>${round.mode==='full'?'FULL SCAN · COMPARES THE LATEST GUESS ONLY':'ONE SIGNAL · CONFIRMED MATCHES STAY GREEN'}</small></div><div class="gtp226-scan-metrics" aria-label="${matches} matching and ${misses} different traits"><span class="matching">✓ ${matches} MATCH</span><span class="different">✕ ${misses} DIFFERENT</span></div></div>
  ${round.mode==='signal'?`<div class="gtp222-locked-intel" role="status" aria-label="Previously confirmed traits"><strong>CONFIRMED INTEL</strong><div>${chips||'<small>Correct traits will stay locked here after every new guess.</small>'}</div></div>`:''}<div class="scanner" role="group" aria-label="Legend scanner">${cells}</div>
  `;
}
function fullScanHistoryMarkup(round,target){
  if(round.mode!=='full'||!round.guesses.length)return '';
  // Each row is a snapshot at that guess: future guesses cannot retroactively change it.
  const rows=round.guesses.map((name,i)=>{
    const snapshot={...round,guesses:round.guesses.slice(0,i+1),hints:[]};
    const state=scannerState(snapshot,target,legends);
    const chips=FIELDS.map(field=>{
      const kind=state[field]?.kind;
      const css=kind==='correct'?'locked':kind==='wrong'?'miss':'pending';
      const marker=kind==='correct'?'✓':kind==='wrong'?'×':'·';
      return '<small class="'+css+'">'+LABELS[field]+' '+marker+'</small>';
    }).join('');
    return '<div class="gtp222-scan-attempt"><b>'+(i+1)+'. '+esc(name)+'</b><span>'+chips+'</span></div>';
  }).join('');
  return '<div class="gtp222-scan-history" aria-label="Full Scan history, preserving previously confirmed traits">'+rows+'</div>';
}
function guessBody(round,target){
  if(round.finished){
    const score=gameScore(round);const rank=gameRank(score);const badges=styleBadges(round);
    return `<div class="end-panel ${round.won?'gtp212-victory':''}"><span class="rank">${round.won?rank:'—'}</span><h2>${round.won?'TARGET FOUND!':round.loss==='time'?'TIME’S UP.':'NICE TRY.'}</h2><p>${round.won?`You identified ${esc(target.name)} in ${round.guesses.length} guesses. ${score} points earned.`:`Your mystery Legend was ${esc(target.name)}. Every guess counts. Try another round!`}</p>${badges.length?`<div class="medal-row">${badges.map(tag=>`<span class="medal">${esc(tag)}</span>`).join('')}</div>`:''}<div class="answer-tag">${portrait(target.slug,{alt:target.name,cls:'balanced'})}<strong>${esc(target.name)}</strong></div>
      <div class="end-actions"><button class="btn pink" data-action="next">${session==='daily'?(dailySummary(store.days,today()).completed?'POST DAILY SCORE':'NEXT DAILY CHALLENGE'):'TRY AGAIN'} ↗</button><button class="btn lilac" data-action="again">∞ FREE PLAY</button><button class="btn ghost" data-action="home">ALL MODES</button></div></div>${session==='daily'?intelReadyMarkup(dailyTrack==='full'?1:2):''}${round.mode==='full'?scannerMarkup(round,target):''}`;
  }
  const hintUnavailable=round.guesses.length===0||round.hints.length>=MAX_HINTS||availableHintFields(round,target,legends).length===0;
  return `<div class="gtp229-stepbar"><div><span class="gtp229-step">02 · YOUR GUESS</span><h2>IDENTIFY THE <em>LEGEND</em></h2></div><strong class="gtp229-remaining">${maxGuesses(round)-round.guesses.length}<small> GUESSES LEFT</small></strong></div>
  <div class="gtp229-answer-zone">
    <div class="search-wrap gtp229-search-wrap"><input id="guess-search" autocomplete="off" aria-label="Search a Legend" placeholder="Type a Legend name…" value="${esc(quickSearch)}"/><button type="button" class="btn pink gtp229-submit" data-action="submit-search" title="Guess the first matching Legend">GUESS ↗</button><div id="search-results" class="search-list" style="display:none"></div></div>
    <div class="guess-tools gtp229-guess-actions"><button type="button" class="btn mint gtp229-browse" data-action="picker">▦ BROWSE LEGENDS</button><button type="button" class="btn lilac gtp229-hint" data-action="hint" ${hintUnavailable?'disabled':''}>✧ GET HINT <small>${MAX_HINTS-round.hints.length} LEFT</small></button></div>
    <p class="gtp229-action-help">${round.guesses.length===0?'Start with any Legend · hints unlock after your first guess':'Choose another Legend, or request a hint if you are stuck.'}</p>
  </div>
  ${round.guesses.length?latestSignal(round,target):''}
  ${round.guesses.length?`<div class="gtp28-instant-history gtp229-history" aria-label="Previous attempts"><b>PREVIOUS GUESSES</b>${round.guesses.map((name,i)=>`<span>${i+1}. ${esc(name)}</span>`).join('')}</div>`:''}
  ${scannerMarkup(round,target)}`;
}

/** V2.30 cinematic round surface: UI only; engine scoring remains unchanged. */
function cinematicIdentityBoard(round,target){
 const state=round.guesses.length?scannerState(round,target,legends):null;
 const names={realName:'REAL NAME',name:'REAL NAME',role:'CLASS',class:'CLASS',age:'AGE',release:'RELEASE',season:'SEASON'};
 const rows=FIELDS.map((field,i)=>{
  const trait=state?.[field];
  const kind=trait?.kind||'hidden';
  const status=kind==='correct'||kind==='hint'?'match':kind==='wrong'?'different':'unknown';
  // The engine's comparison already includes the disclosed actual match;
  // never read the concealed answer here, as UNKNOWN/DIFFERENT remain hidden.
  const wording=scannerDisplayValue(field,trait);
  return `<div class="gtp230-trait gtp230-trait-${status}" aria-label="${esc(LABELS[field])}: ${esc(wording)}">
      <span class="gtp230-trait-icon" aria-hidden="true">${['◈','✥','▦','⌁','✧','◷'][i%6]}</span>
      <span class="gtp230-trait-name">${esc(names[field]||LABELS[field])}</span>
      <strong title="${esc(wording)}">${esc(wording)}</strong>
    </div>`;
 }).join('');
 const description=round.mode==='full'?'LATEST GUESS · ALL SIX TRAITS':'ONE SIGNAL · REVEALED TRAITS ONLY';
 return `<aside class="gtp230-board" aria-label="Identity Signal Board">
   <h2>IDENTITY SIGNAL BOARD</h2><small>${description}</small>
   <div class="gtp230-trait-list">${rows}</div>
  </aside>`;
}
function cinematicStageAside(round,target){
 if(active==='classic'){
  const rows=round.guesses.slice(-5);
  return `<aside class="gtp230-side gtp230-side-history" aria-label="Previous guesses">
    <h2>PREVIOUS GUESSES</h2>${rows.length?
      rows.map((name,i)=>`<div class="gtp230-side-row"><b>${round.guesses.length-rows.length+i+1}</b><span>${esc(name)}</span><em>${name===target.name?'✓':'✕'}</em></div>`).join(''):
      '<p>No guesses yet. Your attempts will appear here.</p>'}
    </aside>`;
 }
 if(active==='pixel'){
  const step=Math.min(6,round.guesses.length);
  return `<aside class="gtp230-side gtp230-side-stages" aria-label="Pixel decryption stages">
    <h2>◈ REVEAL STAGES</h2>
    ${Array.from({length:6},(_,i)=>`<div class="gtp230-stage-item ${step>=i?'is-unlocked':''} ${step===i?'is-current':''}"><span aria-hidden="true">▦</span><strong>STAGE ${i+1}</strong><small>${step>i?'REVEALED':step===i?'CURRENT':'LOCKED'}</small></div>`).join('')}
    <p>Each new guess reveals more of the picture.</p>
   </aside>`;
 }
 if(active==='ability'){
  return `<aside class="gtp230-side gtp230-side-ability" aria-label="Ability category">
   <h2>◈ ABILITY TYPE</h2>
   <div class="gtp230-ability-selected">✧ PASSIVE</div>
   <p>Identify the Legend from this passive ability icon.</p>
  </aside>`;
 }
 if(active==='quote'){
  return `<aside class="gtp230-side gtp230-side-quote" aria-label="Quote clue information">
   <h2>◈ TRANSMISSION</h2>
   <span class="gtp230-wave-deco" aria-hidden="true">▂▅▃▇▄▂▆▃▅▇▃▅▂▇▃▄▆▂</span>
   <p>Read the intercepted line and identify its speaker.</p>
  </aside>`;
 }
 return '';
}
/** Always-visible compact scan controls in gameplay.
 * Daily rounds and rounds in progress show their active settings but lock
 * changes; free-play rules are editable before the first guess only.
 */
function visibleRoundModes(round){
 const locked=session==='daily'||round.guesses.length>0||round.finished;
 const lockCopy=session==='daily'?'DAILY RULES LOCKED':round.finished?'ROUND FINISHED':round.guesses.length?'LOCKED AFTER FIRST GUESS':'SELECT BEFORE FIRST GUESS';
 const button=(label,action,activeMode,extra='')=>`<button type="button" class="gtp235-rule-choice ${activeMode?'is-active':''} ${extra}" data-action="${action}" ${action==='style'?`data-style="${extra==='scan-full'?'full':'signal'}"`:''} aria-pressed="${activeMode?'true':'false'}" ${locked?'disabled':''}>${label}</button>`;
 return `<div class="gtp235-rules" role="group" aria-label="Full Scan, One Signal and Rush settings">
   <span class="gtp235-rules-status" title="${lockCopy}"><b>SCAN RULES</b><small>${lockCopy}</small></span>
   <div class="gtp235-rule-buttons">
     ${button('▦ FULL SCAN','style',round.mode==='full','scan-full')}
     ${button('✦ ONE SIGNAL','style',round.mode==='signal','scan-signal')}
     ${button(`◷ RUSH ${round.timeLimit?round.timeLimit+'s':'OFF'}`,'rush',!!round.timeLimit,'scan-rush')}
   </div>
 </div>`;
}
function triedLegendNote(round){
 if(!round.guesses.length)return '';
 return `<div class="gtp235-tried" role="note" aria-label="Legends you already tried this round">
  <strong>✕ ALREADY TRIED</strong>
  <div class="gtp235-tried-names">${round.guesses.map((name,i)=>`<span title="Guess ${i+1}: ${esc(name)}">× ${esc(name)}</span>`).join('')}</div>
 </div>`;
}
function cinematicControls(round,target){
 if(round.finished){
  const score=gameScore(round);
  return `<section class="gtp230-finished" aria-label="Round result">
   <div class="gtp230-finished-info">
    <span>${round.won?'✓ TARGET IDENTIFIED':round.loss==='time'?'⌛ TIME IS UP':'✕ ROUND COMPLETE'}</span>
    <strong>${esc(target.name)}</strong>
    <small>${round.won?`${score} POINTS · ${round.guesses.length} GUESSES`:'You can try a new round in Free Play.'}</small>
   </div>
   <div class="gtp230-finished-actions">
    <button type="button" data-action="next" class="gtp230-btn gtp230-btn-main">${session==='daily'?'NEXT DAILY STEP':'TRY AGAIN'} ↗</button>
    <button type="button" data-action="again" class="gtp230-btn gtp230-btn-blue">FREE PLAY</button>
    <button type="button" data-action="home" class="gtp230-btn gtp230-btn-secondary">ALL MODES</button>
   </div>
   ${visibleRoundModes(round)}
   ${session==='daily'?intelReadyMarkup(dailyTrack==='full'?1:2):''}
  </section>`;
 }
 const remaining=maxGuesses(round)-round.guesses.length;
 const hintDisabled=!round.guesses.length||round.hints.length>=MAX_HINTS||availableHintFields(round,target,legends).length===0;
 return `<section class="gtp230-console" aria-label="Submit your next guess">
    <div class="gtp230-console-main">
      <div class="search-wrap gtp230-input-wrap">
       <input id="guess-search" autocomplete="off" aria-label="Search a Legend" placeholder="Type a Legend name…" value="${esc(quickSearch)}"/>
       <button type="button" class="gtp230-btn gtp230-btn-main" data-action="submit-search">SUBMIT GUESS ↗</button>
       <div id="search-results" class="search-list" style="display:none"></div>
      </div>
      <div class="gtp230-control-row">
       <button class="gtp230-btn gtp230-btn-blue" type="button" data-action="picker">▣ BROWSE LEGENDS</button>
       <button class="gtp230-btn gtp230-btn-gold" type="button" data-action="hint" ${hintDisabled?'disabled':''}>✦ GET HINT ${round.hints.length?`(${MAX_HINTS-round.hints.length} LEFT)`:''}</button>
       <button class="gtp230-btn gtp230-btn-danger" type="button" data-action="surrender">◷ GIVE UP</button>
      </div>
    </div>
    ${visibleRoundModes(round)}
    <span class="gtp230-console-help">${remaining} guesses left · ${hintDisabled?'Start with a guess to unlock hints':'Green = matching trait · Red = different trait'}</span>
   </section>`;
}
function game(){
 const round=ensureRound();const target=legendByName(legends,round.answer);
 const timeLeft=remainingTime(round),urgent=timeLeft!=null&&timeLeft<=25&&!round.finished;
 const showBoard=round.mode==='full'||round.mode==='signal'&&round.guesses.length>0;
 const board=showBoard?cinematicIdentityBoard(round,target):'';
 const side=cinematicStageAside(round,target);
 const isDaily=session==='daily';
 const title=active.toUpperCase();
 const modeTag=round.mode==='full'?'FULL SCAN':'ONE SIGNAL';
 return `<div class="gtp233-viewport-art" aria-hidden="true"></div><main class="wrap game gtp2-game-scene gtp2-scene-${active} gtp230-game" style="--tile:${classOf(active)}">
   <header class="gtp230-titlebar">
    <div class="gtp230-title-icon" aria-hidden="true">${ICONS[active]}</div>
    <div class="gtp230-title-copy"><h1>${title} MODE</h1><p>${TAGLINES[active]} <span class="gtp230-scan-caption">· ${modeTag}</span></p></div>
    <div class="gtp230-title-status">
     <span class="gtp230-session ${isDaily?'is-daily':'is-free'}">${isDaily?'DAILY':'FREE PLAY'}</span>
     <span class="gtp230-guess-count"><small>GUESSES</small><b>${round.guesses.length}/${maxGuesses(round)}</b></span>
     ${round.timeLimit?`<span id="round-timer" class="game-timer ${urgent?'urgent':''}" aria-label="Time remaining"><i>◷</i><span>${timeLeft??120}s</span></span>`:''}
    </div>
   </header>
   <div class="gtp230-arena ${board?'has-board':''} ${side?'has-side':''}">
    <section class="gtp230-main-clue" aria-label="Legend clue">
     ${getVisual(round,target)}
    </section>
    ${board||side||round.guesses.length? `<div class="gtp236-intel-column">${triedLegendNote(round)}${board||side||''}</div>` : ''}
   </div>
   ${cinematicControls(round,target)}
 </main>`;
}
function howTo(){return `<main class="wrap gtp27-guide" aria-labelledby="guide-title"><span class="kicker">FIELD GUIDE · FIVE WAYS TO PLAY</span><h1 id="guide-title">HOW TO <em>PLAY.</em></h1><p>Choose Daily for two shared puzzles each UTC day: Full Scan first, then One Signal, or Free Play for unlimited practice. Find the mystery Legend using up to six guesses (five in Full Scan).</p>
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
  ['When does Daily reset?','At 00:00 UTC. Daily has two different Legend puzzles: Full Scan first, One Signal second. All five modes rotate across days.'],
  ['Does Free Play affect my leaderboard score?','No. Free Play is unlimited practice. Only completed Daily runs can be submitted.'],
 ['How does Trivia work?','Open the separate Trivia tab. Answer five questions, with 20 seconds per question and 20 points each. Trivia Daily scores use their own rankings; Trivia Practice is unranked.'],
  ['How does scoring work?','Correct guesses earn points. Fewer guesses, fewer hints and optional Rush time remaining give more points. A full-win daily streak adds 5% per consecutive day, capped at 50%.'],
  ['What is One Signal?','One informative trait comparison for each incorrect guess. Six attempts.'],
  ['What is Full Scan?','Six comparisons per guess, but only five guesses.'],
  ['What is Rush OFF?','No timer. With Rush ON, you have 120 seconds after your first guess.'],
  ['Is the leaderboard public?','Yes. Rankings are connected to Supabase. Public entries display nicknames and scores only. Do not use a real name or contact details.'],
  ['Why can a portrait be unavailable?','Some real Legend portraits come from third-party sources. If a source blocks access, we do not replace it with an unrelated character.'],
  ['Is this an official Apex game?','No. It is an independent fan trivia project, not endorsed by EA.']
 ].map(([q,a])=>`<details class="faq-item"><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>
 <div class="guide-cta"><button class="btn pink" data-action="home">BACK TO MODES ↗</button><button class="btn lilac" data-action="howto">HOW TO PLAY</button></div></main>`;}

function trivia(){
 const run=triviaRun;
 const question=run?.question;
 const remaining=question&&run.deadlineAt?Math.max(0,Math.ceil((Date.parse(run.deadlineAt)-Date.now())/1000)):20;
 const isDaily=triviaMode==='daily';
 const rows=triviaBoard?.[triviaScoreTab]||[];
 const feedback=run?.feedback;
 return `<main class="trivia-page ${run&&!run.finished?'trivia-page-active':''} ${question&&!feedback&&!run?.finished?'trivia-page-question':''} ${question?.kind==='text'?'trivia-page-written':''}" aria-label="Apex Trivia"><div class="trivia-shell">
  <section class="trivia-hero"><span class="trivia-kicker">◈ OUTLANDS INTELLIGENCE / VERIFIED QUESTIONS</span><h1>APEX <em>TRIVIA.</em></h1><p>Five questions. 20 seconds each. Every right answer earns <b>20 points</b> — up to 100. Different from Daily Challenges.</p><div class="trivia-switch" role="group" aria-label="Trivia mode"><button data-action="trivia-mode" data-trivia-mode="daily" class="${isDaily?'active':''}">✦ DAILY RANKED</button><button data-action="trivia-mode" data-trivia-mode="practice" class="${!isDaily?'active':''}">∞ PRACTICE</button></div></section>
  <div class="trivia-grid"><section class="trivia-main" id="trivia-main-content" tabindex="-1">
  ${triviaMessage?`<div class="trivia-status" role="status">${esc(triviaMessage)}</div>`:''}
  ${!run?`<div class="trivia-intro"><span class="trivia-tag">${isDaily?'ONE OFFICIAL RUN PER UTC DAY':'UNLIMITED UNRANKED ROUNDS'}</span><h2>${isDaily?'DAILY INTEL DROP':'TRAIN YOUR KNOWLEDGE'}</h2><p>${isDaily?'Everyone receives the same five-question selection today. Answers and timing are verified on the server; results appear on the separate Trivia leaderboard.':'Try varied sets across the question bank; recent topics are rotated when possible. Practice does not affect your global ranking.'}</p><p class="trivia-hint">Your public nickname: <strong>${esc(savedNickname()||'Not set')}</strong> · You can change it in the top navigation.</p><button type="button" data-action="trivia-start" class="trivia-primary" ${triviaBusy?'disabled':''}>${triviaBusy?'CONNECTING…':isDaily?'START / RESUME DAILY →':'START PRACTICE →'}</button></div>`:''}
  ${run?.finished?`<div class="trivia-finale"><span class="trivia-tag">${isDaily?'DAILY SUBMITTED':'PRACTICE COMPLETE'}</span><h2>RUN COMPLETE.</h2><div class="trivia-final-score">${Number(run.score)||0}<small> / 100</small></div><p>${run.score===100?'PERFECT INTEL. FIVE FOR FIVE.':'You answered '+Math.floor(run.score/20)+' of 5 questions correctly.'} ${isDaily?'Your score is stored in the separate Trivia rankings.':'Practice rounds never change the leaderboard.'}</p>${run.feedback?`<div class="trivia-last-explanation"><strong>${run.feedback.correct?'✓ FINAL ANSWER CORRECT':'FINAL QUESTION REVIEW'}</strong><span>${esc(run.feedback.explanation||'')}</span>${run.feedback.source?`<a href="${esc(run.feedback.source)}" target="_blank" rel="noopener noreferrer">Official EA source ↗</a>`:''}</div>`:''}${isDaily&&triviaRewardEarned()?intelReadyMarkup(3):''}<div class="trivia-final-actions"><button type="button" class="trivia-primary" data-action="trivia-mode" data-trivia-mode="practice">∞ PRACTICE AGAIN</button><button type="button" class="trivia-secondary" data-action="trivia-board-refresh">VIEW RANKINGS ↗</button></div></div>`:''}
  ${run&&!run.finished&&feedback?`<div class="trivia-feedback ${feedback.correct?'good':'bad'}"><span class="trivia-tag">QUESTION ${Math.min(run.number-1,5)} / 5</span><h2>${feedback.correct?'✓ CORRECT · +20':feedback.timedOut?'⌛ TIME’S UP · QUESTION EXPIRED':'✕ NOT QUITE'}</h2><p><strong>Accepted answer${feedback.acceptedAnswers?.length>1?'s':''}:</strong> ${esc((feedback.acceptedAnswers||[]).join(' · '))}</p><p>${esc(feedback.explanation||'')}</p>${feedback.source?`<a href="${esc(feedback.source)}" target="_blank" rel="noopener noreferrer">Verify with EA ↗</a>`:''}<p class="trivia-current-score">RUN SCORE: ${run.score} / 100</p><button data-action="trivia-next" class="trivia-primary" ${triviaBusy?'disabled':''}>${triviaBusy?'LOADING…':'NEXT QUESTION →'}</button></div>`:''}
  ${run&&!run.finished&&!feedback&&question?`<div class="trivia-question"><div class="trivia-question-head"><span class="trivia-tag">QUESTION ${run.number} / 5 · ${['CADET','SCOUT','OPERATIVE','SPECIALIST','APEX MASTER'][Math.max(0,Math.min(4,run.number-1))]} · ${esc(question.category.replace(/-/g,' ').toUpperCase())}</span><strong class="trivia-clock ${remaining<=6?'urgent':''}" id="trivia-clock"><span id="trivia-seconds">${remaining}</span>s</strong></div><div class="trivia-timebar"><span id="trivia-timefill" style="width:${Math.max(0,Math.min(100,remaining*5))}%"></span></div><h2>${esc(question.prompt)}</h2><form id="trivia-answer-form">${question.kind==='choice'?`<div class="trivia-options">${question.options.map((v,i)=>`<button class="trivia-option" type="button" data-action="trivia-choice" data-value="${esc(v)}" ${triviaBusy?'disabled':''}><b>${String.fromCharCode(65+i)}</b><span>${esc(v)}</span><span>↗</span></button>`).join('')}</div>`:`<div class="trivia-type"><label for="trivia-written-answer">YOUR ANSWER</label><input id="trivia-written-answer" name="answer" spellcheck="false" autocomplete="off" placeholder="Type a Legend name…" maxlength="70" value="${esc(triviaAnswerText)}" ${triviaBusy?'disabled':''}/><button class="trivia-primary" type="submit" ${triviaBusy?'disabled':''}>SUBMIT ANSWER ↗</button></div>`}</form><button type="button" class="trivia-skip" data-action="trivia-skip" ${triviaBusy?'disabled':''}>SKIP / NO ANSWER</button><p class="trivia-note">The clock continues even when you switch tabs. Answers are evaluated server-side.</p></div>`:''}
  </section><aside class="trivia-sidebar"><div class="trivia-sidehead"><span>✦ SEPARATE TRIVIA RANKINGS</span><div class="trivia-tabs"><button data-action="trivia-board-tab" data-tab="daily" class="${triviaScoreTab==='daily'?'active':''}">TODAY</button><button data-action="trivia-board-tab" data-tab="overall" class="${triviaScoreTab==='overall'?'active':''}">ALL TIME</button></div></div>${triviaBoardBusy?'<p class="trivia-quiet">LOADING SCORES…</p>':triviaBoardError?`<p class="trivia-quiet">${esc(triviaBoardError)}</p>`:rows.length?`<div class="trivia-board-rows">${rows.map((r,i)=>`<div class="trivia-board-row"><b>#${Number(r.position)||i+1}</b><span>${esc(r.player_name||'Player')}</span><strong>${Number(r.score)||0} ${triviaScoreTab==='overall'?'PTS':'/100'}</strong></div>`).join('')}</div>`:'<p class="trivia-quiet">No daily submissions yet. Be the first!</p>'}<div class="trivia-aside-foot"><b>CURATED QUESTION BANK</b><p>Progressive difficulty, varied topics, and fewer repeated questions. Source: official EA game information.</p><button class="trivia-secondary" data-action="trivia-board-refresh">↻ REFRESH LEADERBOARD</button></div></aside></div>
  </div></main>`;
}
async function loadTriviaBoards(){if(!leaderboardConfigured())return;
 triviaBoardBusy=true;triviaBoardError='';if(screen==='trivia')render({scroll:false});
 try{triviaBoard=await getTriviaBoards(today());}catch(e){triviaBoardError=e?.message||'Could not load Trivia rankings';}
 finally{triviaBoardBusy=false;if(screen==='trivia')render({scroll:false});}
}
async function triviaStart(){if(triviaBusy)return;
 const nickname=savedNickname();if(!/^[A-Za-z0-9 _-]{3,18}$/.test(nickname)){triviaMessage='Choose a nickname in the top-right profile first.';render({scroll:false});openIdentityPrompt(true);return;}
 triviaBusy=true;triviaMessage='';render({scroll:false});
 try{triviaRun=await triviaRequest({action:'start',mode:triviaMode,displayName:nickname});saveTriviaReward(triviaRun);triviaAnswerText='';triviaMessage='';if(triviaRun.finished)void loadTriviaBoards();}
 catch(e){triviaMessage=e?.message||'Could not start Trivia';}
 finally{triviaBusy=false;if(screen==='trivia'){render({scroll:false});focusTriviaQuestion();}}
}
async function triviaSubmitAnswer(value,timedOut=false){if(triviaBusy||triviaSubmitting||!triviaRun?.question||triviaRun.finished)return;
 triviaBusy=true;triviaSubmitting=true;let response;
 try{response=await triviaRequest({action:'answer',runId:triviaRun.runId,answer:String(value||'').slice(0,120)});if(timedOut&&response?.feedback)response={...response,feedback:{...response.feedback,timedOut:true}};triviaRun=response;saveTriviaReward(response);triviaAnswerText='';triviaMessage='';sound(response?.feedback?.correct?'correct':'wrong');if(response?.finished){sound('win');void loadTriviaBoards();}}
 catch(e){triviaMessage=e?.message||'Could not submit answer';}
 finally{triviaBusy=false;triviaSubmitting=false;if(screen==='trivia')render({scroll:false});}
}
async function triviaNext(){if(triviaBusy||!triviaRun?.waitingNext)return;
 triviaBusy=true;render({scroll:false});
 try{triviaRun=await triviaRequest({action:'next',runId:triviaRun.runId});triviaMessage='';triviaAnswerText='';}
 catch(e){triviaMessage=e?.message||'Could not load the next question';}
 finally{triviaBusy=false;if(screen==='trivia'){render({scroll:false});focusTriviaQuestion();}}
}
function focusTriviaQuestion(){
 if(screen!=='trivia'||!triviaRun?.question||triviaRun?.finished||triviaRun?.feedback)return;
 requestAnimationFrame(()=>{
  const question=document.querySelector('#trivia-main-content .trivia-question');
  if(!question)return;
  // Keep the entire question, answer box and submit button within the viewport.
  // Avoid focusing the text input, which would force the virtual keyboard open.
  question.scrollIntoView({behavior:'instant',block:'center',inline:'nearest'});
 });
}
function triviaClockTick(){
 // Continuous compositor-friendly progress; the label itself updates only
 // when the displayed whole second changes. The deadline stays server-owned.
 if(triviaClockFrame)cancelAnimationFrame(triviaClockFrame);
 triviaClockFrame=0;
 const frame=()=>{
  const run=triviaRun;
  if(screen!=='trivia'||!run?.question||run?.feedback||!run.deadlineAt){triviaClockFrame=0;return;}
  const remainingMs=Math.max(0,Date.parse(run.deadlineAt)-Date.now());
  const seconds=Math.ceil(remainingMs/1000);
  const digits=document.getElementById('trivia-seconds');
  if(digits&&digits.textContent!==String(seconds))digits.textContent=seconds;
  const fill=document.getElementById('trivia-timefill');
  if(fill)fill.style.transform='scaleX('+Math.max(0,Math.min(1,remainingMs/20000))+')';
  document.getElementById('trivia-clock')?.classList.toggle('urgent',seconds<=6);
  if(remainingMs<=0){
   const key=[run.runId,run.number,run.deadlineAt].join(':');
   if(triviaExpiredKey!==key&&!triviaBusy&&!triviaSubmitting){
    triviaExpiredKey=key;
    void triviaSubmitAnswer('',true);
   }
   triviaClockFrame=0;return;
  }
  triviaClockFrame=requestAnimationFrame(frame);
 };
 triviaClockFrame=requestAnimationFrame(frame);
}
function leaderboard(){
 const summary=dailySummary(store.days,today());
 const rows=boardData?.[boardTab]||[];
 const isTodayComplete=summary.completed && !sharedDay && today()===utcDay();
 const existingSubmission=store.submittedDays?.[today()];
 return `<main class="wrap gtp27-leaderboard" aria-labelledby="rank-title"><span class="kicker">PUBLIC HALL OF FAME / TWO RANKINGS</span><h1 id="rank-title">THE <em>LEADERBOARD.</em></h1><p class="lead">Daily shows today's best hunters. Overall adds all submitted daily scores and streak bonuses.</p>
 <div class="board-switch" role="group" aria-label="Choose leaderboard"><button data-action="board-tab" data-board="daily" class="${boardTab==='daily'?'active':''}" aria-pressed="${boardTab==='daily'}">◈ DAILY · ${esc(utcDay())}</button><button data-action="board-tab" data-board="overall" class="${boardTab==='overall'?'active':''}" aria-pressed="${boardTab==='overall'}">♛ OVERALL · ALL-TIME</button></div>
 <section class="gtp27-board"><div class="board-head"><strong>${boardTab==='daily'?'TOP DAILY HUNTERS':'OVERALL LEGENDS'}</strong><small>${boardLoading&&rows.length?'UPDATING · LAST SAVED RESULTS VISIBLE':leaderboardConfigured()?'LIVE · PUBLIC DATABASE':'DATABASE CONNECTION PENDING'}</small></div>
 ${!leaderboardConfigured()?`<div class="board-empty"><b>RANKINGS NOT CONNECTED YET</b><p>The game owner must link a Supabase project first. The database and server validation code are included in this release.</p></div>`:boardLoading&&!rows.length?'<div class="board-empty">LOADING THE LEADERBOARD…</div>':boardError&&!rows.length?`<div class="board-empty">${esc(boardError)}</div>`:rows.length?`<div class="board-table">${rows.map((line,i)=>`<div class="board-row"><span>#${Number(line.position)||i+1}</span><strong>${esc(line.player_name)}</strong><b>${Number(line.score).toLocaleString('en-US')} PTS</b><small>${boardTab==='daily'?`✦ STREAK ${Number(line.streak)||0}`:`${Number(line.days_played)||0} DAYS · BEST ${Number(line.best_streak)||0}`}</small></div>`).join('')}</div>`:'<div class="board-empty">NO SCORES YET. BE THE FIRST!</div>'}</section>
 <section class="gtp27-submit"><div><span class="kicker">YOUR DAILY SCORE</span><h2>${summary.score.toLocaleString('en-US')} <small>PTS (LOCAL PREVIEW)</small></h2><p>${existingSubmission?`✓ DAILY SCORE SUBMITTED · ${Number(existingSubmission.totalScore||0).toLocaleString('en-US')} POINTS · SAVED ON THIS DEVICE`:summary.completed?'Two Daily Challenges complete. Submit once to appear in the public rankings.':'Complete both Daily Challenges to submit your score. Practice rounds do not count.'}</p><small>BASE ${summary.baseScore.toLocaleString('en-US')} · STREAK BONUS ${summary.bonus.toLocaleString('en-US')} · ${summary.streak} DAY STREAK</small></div>
 <form class="board-form" id="board-submit-form"><label for="board-nickname">PUBLIC NICKNAME</label><input id="board-nickname" name="nickname" minlength="3" maxlength="18" autocomplete="nickname" pattern="[A-Za-z0-9 _-]{3,18}" placeholder="Your gamer nickname" value="${esc(savedNickname())}" ${isTodayComplete&&leaderboardConfigured()&&!existingSubmission?'':'disabled'}/><button class="btn pink" type="submit" ${isTodayComplete&&leaderboardConfigured()&&!existingSubmission?'':'disabled'}>${existingSubmission?'✓ SUBMITTED':'SUBMIT DAILY SCORE ↗'}</button><small>One submission per UTC day · nickname is visible to everyone · no real names. <button class="inline-link" type="button" data-action="profile">Change nickname</button></small><p id="board-submit-feedback" class="board-submit-feedback" role="status" aria-live="polite"></p></form></section>
 <div class="guide-cta"><button class="btn lilac" data-action="home">BACK TO CHALLENGES</button><button class="btn mint" data-action="records">MY STATS ↗</button></div></main>`;
}
async function refreshBoards(){
 if(!leaderboardConfigured()||boardLoading)return;
 boardLoading=true;boardError='';
 // Keep the visible leaderboard while the request is pending.
 try{boardData=await getBoards(utcDay());localStorage.setItem(SAVED_BOARD_KEY,JSON.stringify({day:utcDay(),boards:boardData,updatedAt:Date.now()}));}catch(error){boardError=error.message||'Connection unavailable';}
 finally{boardLoading=false;if(screen==='leaderboard')render({scroll:false});}
}
async function submitScores(){
 if(!leaderboardConfigured()){showToast('Database not configured yet');return;}
 const summary=dailySummary(store.days,today());
 if(!summary.completed||sharedDay||today()!==utcDay()){showToast('Complete both Daily Challenges first');return;}
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
  store.submittedDays={...(store.submittedDays||{}),[today()]:{...receipt,nickname,submittedAt:Date.now()}};sync();
  await refreshBoards();const message=`SCORE SUBMITTED · ${receipt.totalScore} PTS · STREAK ${receipt.streak}`;showToast(message);const status=document.getElementById('board-submit-feedback');if(status){status.textContent=message;status.dataset.status='success';}
 }catch(error){const message=error.message||'Submission failed';showToast(message);if(feedback){feedback.textContent=message;feedback.dataset.status='error';}if(button){button.disabled=false;button.textContent='SUBMIT DAILY SCORE ↗';}}
}
function records(){
  const stats=dailyStats(store.days,utcDay());const days=Object.keys(store.days).sort().reverse().slice(0,14);
  return `<main class="wrap records"><span class="pill">PERSONAL ARCHIVE</span><h1>YOUR <span style="color:#ec4a95">SIGNAL.</span></h1><p class="lead">Records are stored in your browser. Global rankings require a connected database; local stats remain in this browser.</p>${statCards()}${forbiddenPanel()}<h2 class="caps" style="font-size:38px">RECENT DAYS</h2><div class="record-rows">${days.map(day=>`<div class="record-row"><span>${day}</span><span>${checkpointCount(store.days,day)}/2 ${checkpointCount(store.days,day)===2?'✦ CLEARED':''}</span></div>`).join('')||'<p>No Daily results yet. Go start a hunt!</p>'}</div><div class="record-settings"><div><strong>ACCESSIBILITY / VISUAL EFFECTS</strong><small>Reduce background and reward animation intensity on slower devices.</small></div><button class="btn lilac small" data-action="motion">FX ${store.settings.motion?'ON':'OFF'} · CHANGE</button></div><button class="btn pink" data-action="home">BACK TO CHALLENGES ↗</button><button class="btn mint" data-action="leaderboard">♛ GLOBAL LEADERBOARD</button></main>`;
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
  app.dataset.screen=screen;app.dataset.session=session;app.dataset.mode=screen==='game'?active:'';
  app.innerHTML=nav()+(screen==='home'?home():screen==='game'?game():screen==='trivia'?trivia():screen==='records'?records():screen==='howto'?howTo():screen==='faq'?faq():leaderboard());
  loadPortraitImages();
  loadAbilityImages();
  if(screen==='trivia')triviaClockTick();
  if(scroll)window.scrollTo({top:0,behavior:'instant'});
  if(screen==='game'&&!getRound()?.finished)updateSearchResults();
  if(pickerOpen)renderPicker();
  if(!identityPromptOpen&&!savedNickname()&&!store.profile?.askedName)openIdentityPrompt();
}

function openMode(mode,playSession=session){
  if(!MODES.includes(mode))return;
  if(playSession==='daily'){
    const schedule=dailySchedule(today());
    const targetTrack=Object.entries(schedule).find(([,m])=>m===mode)?.[0];
    if(targetTrack){if(targetTrack==='signal'&&!currentDailyRounds(store.days,today()).full?.finished){showToast('Finish Full Scan to unlock One Signal.');return;}dailyTrack=targetTrack;}
    else playSession='unlimited';
  }
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
  } else {
     if(next.finished)sound('lose');
     else if(next.mode==='full'){
       const target=legendByName(legends,next.answer);
       const current=scannerState(next,target,legends);
       sound(FIELDS.some(f=>current[f]?.kind==='correct')?'clue':'wrong');
     }else sound(next.signals.at(-1)?.kind==='correct'?'clue':'wrong');
   }
  pickerOpen=false;quickSearch='';render({scroll:false});
  if(session==='daily'&&next.finished)showToast('✦ FORBIDDEN INTEL READY — Open the unlocked tip below!');
  if(justWon){sound('victory');if(store.settings.motion&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches)triggerVictoryConfetti();}
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
 const rounds=currentDailyRounds(store.days,today());
 if(!rounds.full?.finished){openMode(dailySchedule(today()).full,'daily');return;}
 if(!rounds.signal?.finished){dailyTrack='signal';openMode(dailySchedule(today()).signal,'daily');return;}
 screen='leaderboard';pickerOpen=false;render();void refreshBoards();sound('nav');
}
function showToast(message){
  document.querySelector('.toast')?.remove();
  const toast=document.createElement('div');toast.className='toast';toast.setAttribute('role','status');toast.textContent=message;app.appendChild(toast);
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.remove(),3000);
}
let lastModeHover=0;
app.addEventListener('pointerover',event=>{
  const card=event.target.closest?.('.arena-mode,.gtp222-orbit-card');
  if(!card||!store.settings.audio)return;
  if(event.relatedTarget instanceof Node&&card.contains(event.relatedTarget))return;
  const now=performance.now();if(now-lastModeHover<210)return;lastModeHover=now;
  const mode=card.dataset.mode;
  if(MODES.includes(mode))sound('hover-'+mode);
  else if(card.classList.contains('gtp222-card-trivia'))sound('hover-quote');
});
app.addEventListener('click',event=>{
  const button=event.target.closest('[data-action]');if(!button||button.disabled)return;
  const action=button.dataset.action;
  if(action==='intel-open'){
  const checkpoint=Number(button.dataset.checkpoint)||1;
  if(checkpoint===3?!triviaRewardEarned():checkpoint>checkpointCount(store.days,today())){showToast(checkpoint===3?"Complete Daily Trivia to unlock this reward.":`Complete Daily Challenge ${checkpoint} to unlock the reward.`);return;}
  intelCheckpoint=checkpoint;store.intelOpenedDays??={};const claimKey=`${today()}:${checkpoint}`;
  intelFirstRevealPending=!intelState(checkpoint).read;store.intelOpenedDays[claimKey]=true;sync();intelDialog();
}
  else if(action==='intel-close'){closeIntelDialog();render({scroll:false});}
  else if(action==='wheel')showWheel();
  else if(action==='close-wheel')closeWheel();
  else if(action==='spin')spinWheel();
  else if(action==='share-wheel')void copyWheelPick();
  else if(action==='home'){screen='home';pickerOpen=false;render();sound('nav');}
  else if(action==='trivia'){screen='trivia';pickerOpen=false;triviaMessage='';triviaRun=null;render();void loadTriviaBoards();sound('nav');}
  else if(action==='trivia-mode'){triviaMode=button.dataset.triviaMode==='practice'?'practice':'daily';triviaRun=null;triviaMessage='';render({scroll:false});sound('nav');}
  else if(action==='trivia-start')void triviaStart();
  else if(action==='trivia-choice')void triviaSubmitAnswer(button.dataset.value);
  else if(action==='trivia-skip')void triviaSubmitAnswer('');
  else if(action==='trivia-next')void triviaNext();
  else if(action==='trivia-board-tab'){triviaScoreTab=button.dataset.tab==='overall'?'overall':'daily';render({scroll:false});}
  else if(action==='trivia-board-refresh')void loadTriviaBoards();
  else if(action==='records'){screen='records';pickerOpen=false;render();sound('nav');}
  else if(action==='howto'){screen='howto';pickerOpen=false;render();sound('nav');}
  else if(action==='faq'){screen='faq';pickerOpen=false;render();sound('nav');}
  else if(action==='leaderboard'){screen='leaderboard';pickerOpen=false;render();void refreshBoards();sound('nav');}
  else if(action==='scroll-extras'){document.getElementById('home-extras')?.scrollIntoView({behavior:store.settings.motion?'smooth':'instant'});}
  else if(action==='board-tab'){boardTab=button.dataset.board;render({scroll:false});if(!boardData)void refreshBoards();}
  else if(action==='open'){openMode(button.dataset.mode,button.dataset.session||'unlimited');}
  else if(action==='home-daily'){
    const rounds=currentDailyRounds(store.days,today());session='daily';
    const next=DAILY_TRACKS.find(track=>!rounds[track]?.finished);
    if(next){dailyTrack=next;openMode(dailySchedule(today())[next],'daily');}
    else{screen='leaderboard';render();void refreshBoards();}
  }
  else if(action==='session'){
    if(button.dataset.session==='unlimited')openMode(active||'classic','unlimited');
    else{const first=DAILY_TRACKS.find(track=>!currentDailyRounds(store.days,today())[track]?.finished);dailyTrack=first||'full';openMode(dailySchedule(today())[dailyTrack],'daily');}
  }
  else if(action==='profile'){openIdentityPrompt(true);sound('pick');}
  else if(action==='identity-skip'){closeIdentityPrompt();}
  else if(action==='settings'){settingsDialog();sound('nav');}
  else if(action==='settings-close'){document.getElementById('gtp237-settings')?.remove();}
  else if(action==='sound-preview'){sound('victory');}
  else if(action==='audio'){store.settings.audio=!store.settings.audio;sync();document.querySelectorAll('.gtp2-sound-switch').forEach(node=>{node.textContent=store.settings.audio?'♫ FX ON':'♪ FX OFF';node.setAttribute('aria-pressed',String(store.settings.audio))});if(button.closest('.gtp237-settings-panel'))button.textContent='SOUND '+(store.settings.audio?'ON':'OFF');if(store.settings.audio)sound('pick');}
  else if(action==='motion'){store.settings.motion=!store.settings.motion;sync();if(button.closest('.gtp237-settings-panel')){button.textContent='ANIMATIONS '+(store.settings.motion?'ON':'OFF');app.classList.toggle('no-motion',!store.settings.motion);}else render({scroll:false});}
  else if(action==='picker'){pickerOpen=true;pickerSearch='';pickerClass='All';pickerSort='az';renderPicker();sound('pick');}
  else if(action==='close-picker'){pickerOpen=false;document.getElementById('picker-backdrop')?.remove();}
  else if(action==='guess'){submitGuess(button.dataset.name);}
  else if(action==='submit-search'){
    const query=document.getElementById('guess-search')?.value||'';
    const first=filteredRoster(legends,{search:query,excluded:getRound()?.guesses||[]})[0];if(query.trim()&&first)submitGuess(first.name);
  }
  else if(action==='style'||action==='rush'){
    const round=getRound();if(!round||session==='daily'||round.guesses.length||round.finished)return;
    const changed=action==='style'?{...round,mode:button.dataset.style}:{...round,timeLimit:round.timeLimit?0:120};
    store.settings.playStyle=changed.mode;store.settings.rush=changed.timeLimit>0;setRound(changed);
    sync();render({scroll:false});sound('pick');
  }
  else if(action==='surrender'){
    const current=getRound();
    if(!current||current.finished)return;
    if(!window.confirm('Give up this round? Your remaining guesses will be used and this round will count as a loss.'))return;
    // Consume remaining moves as replayable wrong guesses so Daily results still
    // validate against the server's official puzzle-answer algorithm.
    let discarded=current;
    const now=Date.now();
    for(const candidate of legends){
      if(discarded.finished)break;
      if(candidate.name===discarded.answer||discarded.guesses.includes(candidate.name))continue;
      discarded=tryGuess(discarded,candidate.name,legends,now);
    }
    if(discarded!==current){setRound(discarded);pickerOpen=false;quickSearch='';render({scroll:false});sound('lose');}
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
  if(event.target.id==='trivia-answer-form'){event.preventDefault();void triviaSubmitAnswer(document.getElementById('trivia-written-answer')?.value||'');return;}
  if(event.target.id==='identity-form'){event.preventDefault();const form=new FormData(event.target);const nickname=String(form.get('nickname')||'').trim().replace(/\s+/g,' ');const input=document.getElementById('identity-name');if(!input?.checkValidity()){input?.reportValidity();return;}saveNickname(nickname);render({scroll:false});showToast(`Nickname saved: ${nickname}`);}
});
app.addEventListener('focusin',event=>{
 if(event.target?.id!=='trivia-written-answer')return;
 // The keyboard can reduce the visual viewport. Keep the entry area visible,
 // while leaving text selection and typing to the browser.
 requestAnimationFrame(()=>{
  const input=document.getElementById('trivia-written-answer');
  input?.scrollIntoView({behavior:'instant',block:'nearest'});
 });
});
app.addEventListener('input',event=>{
 if(event.target.id==='gtp237-volume'){const level=Number(event.target.value);store.settings.volume=Math.max(0,Math.min(1,level/100));document.getElementById('gtp237-volume-output').textContent=level+'%';sync();}
  if(event.target.id==='guess-search'){quickSearch=event.target.value;updateSearchResults();}
  if(event.target.id==='trivia-written-answer')triviaAnswerText=event.target.value;
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
 if(document.getElementById('gtp237-settings')){document.getElementById('gtp237-settings').remove();return;}
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



// Keep open tabs synchronized without overwriting server-backed leaderboards.
window.addEventListener('storage',event=>{if(event.key==='guess-the-predator-2:daybreak-v1'){const fresh=loadStore();if(fresh?.days){store=fresh;render({scroll:false});}}});
