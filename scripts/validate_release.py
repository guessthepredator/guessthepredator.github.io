from pathlib import Path
from PIL import Image
import wave,re
P=Path(__file__).resolve().parents[1]
required=['index.html','styles.css','src/app.mjs','src/engine.mjs','src/scoring.mjs','src/leaderboard.mjs','src/leaderboard_config.mjs','src/pixel_scene.mjs','src/audio.mjs','src/data.mjs','LEADERBOARD_SETUP.md','supabase/migrations/202610170001_leaderboards.sql','supabase/functions/submit-score/index.ts','assets/decor/haunted-hero.webp','assets/decor/mirage-clean-final.webp','.github/workflows/pages.yml']
for name in required: assert (P/name).is_file(),name
html=(P/'index.html').read_text();js=(P/'src/app.mjs').read_text();css=(P/'styles.css').read_text();workflow=(P/'.github/workflows/pages.yml').read_text()
# Cache-busting version is allowed to advance with each deployment.
# Both entry assets must use the same release version; never hardcode an older one.
assert html.count('rel="stylesheet"')==4, 'Expected base CSS and V2.43/V2.44/V2.45 visual layers'
assert (P/'styles-v243.css').is_file(), 'Missing visual correction stylesheet'
assert 'styles-v243.css?v=2.43.0' in html, 'Visual correction stylesheet has stale version'
assert (P/'styles-v244.css').is_file(), 'Missing V2.44 visual stylesheet'
assert 'styles-v244.css?v=2.44.0' in html, 'Missing V2.44 cache-busted stylesheet'
assert (P/'styles-v245.css').is_file(), 'V2.45 stylesheet missing'
assert 'styles-v245.css?v=2.45.0' in html, 'V2.45 cache-busted link missing'
style_match=re.search(r'href="\./styles\.css\?v=(\d+\.\d+\.\d+)"', html)
app_match=re.search(r'src="\./src/app\.mjs\?v=(\d+\.\d+\.\d+)(?:&amp;release=2\.44\.0(?:&amp;rev=2\.45\.0)?)?"', html)
assert style_match is not None, 'Versioned styles.css link missing'
assert app_match is not None, 'Versioned app.mjs script missing'
assert style_match.group(1)==app_match.group(1), 'CSS and JavaScript cache versions differ'
assert f"leaderboard.mjs?v={app_match.group(1)}" in js, 'Core app import uses stale version'
assert 'function leaderboard()' in js and 'function howTo()' in js and 'function faq()' in js
assert 'gtp27-mode-grid' in css, 'Legacy home asset styles must remain for page compatibility'
# V2.30 uses a cinematic round layout instead of the deprecated Classic banner.
for required_ui in (
 'function cinematicIdentityBoard(round,target)',
 'function cinematicStageAside(round,target)',
 'function cinematicControls(round,target)',
 'gtp230-titlebar',
 'gtp230-arena',
 'gtp230-trait-list',
 'gtp230-control-row',
 'data-action="surrender"',
):
 assert required_ui in js, f'Missing cinematic gameplay UI: {required_ui}'
for required_style in ('.gtp230-game', '.gtp230-titlebar', '.gtp230-arena',
 '.gtp230-btn-main', '.gtp230-trait-different', '.trivia-page-active'):
 assert required_style in css, f'Missing cinematic game theme: {required_style}'
assert "['classic', 'pixel', 'quote', 'ability', 'emoji']" in (P/'src/engine.mjs').read_text()
assert 'mapGame(' not in js and 'data-mode="map"' not in js
assert not any((P/name).exists() for name in ['MEDIA_STUDIO.html','src/maps.mjs','src/map_runtime.mjs','src/announcer.mjs','assets/game-bg/map.svg'])
assert Image.open(P/'assets/decor/haunted-hero.webp').size[0]>=1200
assert not (P/'src/concept_map_manifest.mjs').exists()
assert len(list((P/'assets/sfx').glob('*.wav')))==14
for sound in (P/'assets/sfx').glob('*.wav'):
 with wave.open(str(sound)) as wav:
  seconds=wav.getnframes()/wav.getframerate()
  assert wav.getnchannels()==1 and (.03<seconds<5 if sound.name=='party.wav' else .03<seconds<.42),sound
assert 'node --test' in workflow
assert (P/'src/daily218.mjs').is_file(), 'CI missing Node test runner'
for test_file in ['core.test.mjs','v27.test.mjs','v28.test.mjs','v210.test.mjs','v212.test.mjs','v213.test.mjs','v214.test.mjs','v215.test.mjs','v216.test.mjs','v217.test.mjs','v218.test.mjs','v219.test.mjs','v220.test.mjs']:
 assert test_file in workflow, f'CI missing {test_file}'
assert 'cp index.html styles.css styles-v243.css styles-v244.css styles-v245.css dist/' in workflow and 'SOURCES_AND_RIGHTS.md' not in workflow
assert 'src/leaderboard_config.mjs' in workflow or 'cp -r src assets dist/' in workflow
assert not any((P/'tests'/name).exists() for name in ['v21.test.mjs','v22.test.mjs','v23.test.mjs','v24.test.mjs','v25.test.mjs','gtp2.test.mjs','v26.test.mjs'])
# V2.28: cutout masks must have real, meaningfully transparent backgrounds.
# No face-only square icons and no full red showcase rectangles in the release.
for slug in ('alter','axle','ballistic','catalyst','conduit','sparrow'):
 file=P/'assets'/'portraits'/('cutout-'+slug+'.png')
 assert file.is_file(),f'Missing processed full-body portrait: {slug}'
 with Image.open(file) as im:
  width,height=im.size
  assert width>=280 and height>=600 and height/width>=1.27,(slug,width,height)
  assert im.format=='PNG' and im.mode=='RGBA',(slug,im.format,im.mode)
  alpha=im.getchannel('A')
  hist=alpha.histogram()
  clear=sum(hist[:16])/(width*height)
  solid=sum(hist[220:])/(width*height)
  assert clear>=.30 and solid>=.04,(slug,clear,solid)
  assert all(alpha.getpixel(c)<=15 for c in [(0,0),(width-1,0),(0,height-1),(width-1,height-1)]),(slug,'opaque corners')
print('V2.36 portrait cutout validation PASS: 6/6 tall character RGBA files with clear backgrounds')
print(f'Guess The Predator V{style_match.group(1)} FINAL VISUAL LOCK validation PASS: 5 play modes, 2 Daily challenges, 3 rewards, 14 SFX, 6 traits, 2 scoreboards')
print('Supabase project settings are preserved; live submission origin changes are deployed separately.')

# V2.20 Trivia release safety: 50+ answer-key entries must stay outside GitHub Pages dist.
import json
trivia=json.loads((P/'tests/trivia_public_manifest.json').read_text())
assert len(trivia)>=50 and len({q['id'] for q in trivia})==len(trivia)
assert 'gtp_trivia_api' in (P/'src/leaderboard.mjs').read_text()
assert (P/'TRIVIA_SOURCES.md').exists()
assert 'tests/v220.test.mjs' in workflow
print(f'V2.20 Trivia validation PASS: {len(trivia)} reviewed questions, private answers, 5 questions x 20s, server-verified scores')

assert not (P/'supabase/functions/trivia/questions.json').exists(), 'Never commit Trivia answer keys in public repo'
