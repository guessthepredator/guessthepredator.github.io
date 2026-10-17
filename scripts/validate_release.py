from pathlib import Path
from PIL import Image
import json, wave, re
P=Path(__file__).resolve().parents[1]
required=['index.html','styles.css','src/app.mjs','src/engine.mjs','src/maps.mjs','src/pixel_scene.mjs','src/audio.mjs','src/data.mjs','assets/decor/haunted-hero.webp','assets/map-catalog.json','.github/workflows/pages.yml']
for filename in required:assert (P/filename).is_file(),f'MISSING {filename}'
locs=json.loads((P/'assets/map-catalog.json').read_text())
assert len(locs)==36 and len({l['id'] for l in locs})==36 and len({l['map'] for l in locs})==6
assert Image.open(P/'assets/decor/haunted-hero.webp').size[0]>=1200
html=(P/'index.html').read_text();app=(P/'src/app.mjs').read_text();css=(P/'styles.css').read_text();workflow=(P/'.github/workflows/pages.yml').read_text()
assert html.count('rel="stylesheet"')==1 and 'styles.css?v=2.6.0' in html
assert 'app.mjs?v=2.6.0' in html and 'NOVA' in html
assert 'paintPixelScene' in app and 'scenePalette' in (P/'src/pixel_scene.mjs').read_text()
assert 'id="mirage-gaze"' not in app and 'MEDIA_STUDIO' not in app
for word in ['announcerAvailable','stopAnnouncer','voiceCue(\'ready\')','say(\'ready\')','data-action="announcer"']:
 assert word not in app,word
assert 'gtp2-backdrop' in app and '.gtp2-hero' in css
assert "session==='daily'?`<button data-action=\"home-daily\"" in app
assert not any((P/name).exists() for name in ['pinkshift.css','dark-pink-v23.css','eclipse-v24.css','lightshift-v25.css','MEDIA_STUDIO.html','MEDIA_DIAGNOSTIC.html'])
assert not (P/'src/announcer.mjs').exists()
assert not (P/'assets/map-recon').exists()
assert not (P/'src/concept_map_manifest.mjs').exists()
assert len(list((P/'assets/sfx').glob('*.wav')))==14
for path in (P/'assets/sfx').glob('*.wav'):
 with wave.open(str(path)) as wav:
  assert wav.getnchannels()==1 and 0.03<wav.getnframes()/wav.getframerate()<.42,path
assert 'cp index.html styles.css dist/' in workflow and 'install_cc0_announcer' not in workflow
assert 'styles.css' in workflow
for path in (P/'src').glob('*.mjs'):
 assert '?v=2.5.1' not in path.read_text(),path
print('NOVA V2.6 release audit PASS: 36 POIs, 1 stylesheet, 14 nonverbal SFX, no announcer, no simulated Map assets')
print('Map/portraits remain third-party: live availability and usage permissions not certified.')
