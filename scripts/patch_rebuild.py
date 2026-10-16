from pathlib import Path
R=Path(__file__).resolve().parents[1]
def update(file,old,new,need=True):
 p=R/file;s=p.read_text()
 if need and old not in s:raise ValueError(f'Missing snippet: {file}: {old[:100]}')
 s=s.replace(old,new);p.write_text(s)
# Map images prefer user screenshots and fall back to local scene-specific visual intel.
update('src/maps.mjs',"return ['webp','png','jpg','jpeg'].map(ext=>mapLocalPath(entry,ext));","return [...['webp','png','jpg','jpeg'].map(ext=>mapLocalPath(entry,ext)),`./assets/map-recon/${entry.id}.svg`];")
update('src/maps.mjs',"return [...manifest.slice(start),...manifest.slice(0,start)];","return [...manifest.slice(start),...manifest.slice(0,start),`./assets/map-recon/${entry.id}.svg`];")
# Page version and theme
p=R/'index.html';s=p.read_text().replace('v=2.2.1-rollback','v=2.3.0').replace(' — Pinkshift Portrait Restore',' — Dark Pink Reforged')
s=s.replace('<title>','<link rel="stylesheet" href="./dark-pink-v23.css?v=2.3.0"/><title>');p.write_text(s)
# Store keeps progress between updates; add announcer setting without erasing saves.
update('src/store.mjs',"settings:{audio:true,motion:true,playStyle:'signal',rush:false}","settings:{audio:true,announcer:true,motion:true,playStyle:'signal',rush:false}")
# App UI and events
p=R/'src/app.mjs';s=p.read_text()
s=s.replace("import {playSound} from './audio.mjs';", "import {playSound} from './audio.mjs';\nimport {say,stopAnnouncer,announcerAvailable} from './announcer.mjs';")
s=s.replace("const sound=name=>playSound(name,store.settings.audio);", "const sound=name=>playSound(name,store.settings.audio);\nconst voiceCue=name=>{void say(name,store.settings.announcer&&store.settings.audio);};")
s=s.replace("<small>PINKSHIFT · DARK BLOOM</small>","<small>DARK PINK · REFORGED V2.3</small>")
s=s.replace("<span class=\"gtp2-kicker\">✦ PINKSHIFT / DARK OUTLANDS</span>","<span class=\"gtp2-kicker\">✦ DARK PINK / HAUNTED OUTLANDS</span>")
s=s.replace('<button class="gtp2-audio-preview" data-action="sound-test" title="Preview original UI sound">▶ TEST</button>', '<button class="gtp2-audio-preview" data-action="sound-test" title="Preview original UI sound">◖)) TEST</button><button class="gtp2-voice-toggle" data-action="announcer" title="CC0 human voice announcer" aria-pressed="${store.settings.announcer}">${store.settings.announcer?\'🎙 HUMAN ON\':\'🎙 HUMAN OFF\'}</button>')
s=s.replace("if(img.naturalWidth<180||img.naturalHeight<100){next();return;}\n      frame?.classList.add('has-map-art');", "if(img.naturalWidth<180||img.naturalHeight<100){next();return;}\n      frame?.classList.add('has-map-art');\n      frame?.classList.toggle('recon-art',img.currentSrc.includes('/map-recon/'));")
s=s.replace('alt="Location image provided by the site owner"','alt="POI-specific landmark clue illustration or owner-provided gameplay screenshot"')
s=s.replace('<div class="map-credit">NO VERIFIED POI IMAGE INSTALLED · TEXT CLUE AVAILABLE</div>', '<div class="map-credit"><span class="recon-credit">ORIGINAL LANDMARK RECONSTRUCTION · NOT A GAME SCREENSHOT</span><span class="capture-credit">OWNER-PROVIDED LOCAL SCREENSHOT</span></div>')
s=s.replace("<h1>GUESS THE MAP<span style=\"color:#36c3cf\">.</span></h1><p>Identify the map and POI using a verified local image or the written clue.</p>","<h1>GUESS THE MAP<span style=\"color:#ff6ebf\">.</span></h1><p>Inspect location-specific architectural clues. Real screenshots take priority when installed.</p>")
s=s.replace("<p>${round.finished?`Answer: ${esc(entry.map)} / ${esc(entry.poi)}.`:stage===1?'You have three map attempts. Each wrong map is eliminated.':'Map confirmed. Find the exact location in two attempts.'}</p>","<p>${round.finished?`Answer: ${esc(entry.map)} / ${esc(entry.poi)}.`:stage===1?'You have three map attempts. Each wrong map is eliminated.':'Map confirmed. Find the exact location in two attempts.'}</p><div class=\"map-structural-intel\"><small>⌖ LANDMARK READOUT</small><p>${esc(entry.clue)}</p></div>")
s=s.replace('   <canvas id="mirage-gaze" aria-hidden="true"></canvas><div class="gtp2-vignette" aria-hidden="true"></div>', '   <div class="gtp2-vignette" aria-hidden="true"></div>')
s=s.replace('  drawGaze();\n','')
s=s.replace("stopVoice();voiceClipStatus='';active=mode;session=playSession;screen='game';pickerOpen=false;quickSearch='';ensureRound();render();sound('nav');", "stopVoice();stopAnnouncer();voiceClipStatus='';active=mode;session=playSession;screen='game';pickerOpen=false;quickSearch='';ensureRound();render();sound('nav');voiceCue('ready');")
s=s.replace("store.history.bestScore=Math.max(store.history.bestScore||0,gameScore(next));sync();sound('win');", "store.history.bestScore=Math.max(store.history.bestScore||0,gameScore(next));sync();sound('win');voiceCue('mission_completed');")
s=s.replace("  } else sound(next.signals.at(-1)?.kind==='correct'?'correct':'wrong');", "  } else {sound(next.signals.at(-1)?.kind==='correct'?'correct':'wrong');if(next.finished)voiceCue('mission_failed');}")
s=s.replace("if(updated.won){store.history.wins++;sync();sound('win');}else sound(updated.finished?'lose':'pick');", "if(updated.won){store.history.wins++;sync();sound('win');voiceCue('mission_completed');}else{sound(updated.finished?'lose':'pick');if(updated.finished)voiceCue('mission_failed');}")
s=s.replace("else if(action==='audio'){store.settings.audio=!store.settings.audio;sync();sound('pick');render({scroll:false});}","else if(action==='audio'){store.settings.audio=!store.settings.audio;sync();sound('pick');render({scroll:false});}\n  else if(action==='announcer'){store.settings.announcer=!store.settings.announcer;sync();render({scroll:false});if(store.settings.announcer)voiceCue('ready');}")
s=s.replace("else if(action==='sound-test'){if(!store.settings.audio){store.settings.audio=true;sync();}sound('reveal');render({scroll:false});}", "else if(action==='sound-test'){if(!store.settings.audio){store.settings.audio=true;sync();}sound('reveal');voiceCue('ready');render({scroll:false});}")
s=s.replace("if(expired!==round){setRound(expired);sound('lose');render({scroll:false});return;}","if(expired!==round){setRound(expired);sound('lose');voiceCue('time_over');render({scroll:false});return;}")
# Additional browse content small role label, make portrait area larger by CSS. Avoid generic standins.
s=s.replace('<div class="picker-count" id="picker-count"></div>','<div class="picker-count" id="picker-count"></div><div class="picker-visual-note">CHARACTER PORTRAITS · ORIGINAL GAME SOURCES WHEN AVAILABLE · NO GENERIC REPLACEMENTS</div>')
s=s.replace('<span>6 ARENAS · 36 LOCATIONS · TEXT QUOTES</span>','<span>6 ARENAS · 36 LOCATION RECONS · CC0 HUMAN ANNOUNCER</span>')
s=s.replace('const blur=[14,11,8,5,3,1,0];','const blur=[18,14,10,6,3,1,0];')
# Friendly Quote: voice announcer is separate, Quote stays written to prevent misleading identity.
s=s.replace('◈ DECRYPTED / TEXT ONLY','◈ ORIGINAL QUOTE / NO VOICE IMPERSONATION')
# Remove meaningless stale code from no-op gaze body but legacy tests now update.
import re
s=re.sub(r'// Eye overlay removed in Dark Bloom cleanup\.[\s\S]*?window.addEventListener\(\'resize\',\(\)=>\{\}, \{passive:true\}\);','// The character is painted only once inside the backdrop art. No artificial gaze overlay.',s,count=1)
p.write_text(s)
print('patched core JS, store, maps, workflow, index')
