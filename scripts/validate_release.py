from pathlib import Path
from PIL import Image
import wave,re
P=Path(__file__).resolve().parents[1]
required=['index.html','styles.css','src/app.mjs','src/engine.mjs','src/scoring.mjs','src/leaderboard.mjs','src/leaderboard_config.mjs','src/pixel_scene.mjs','src/audio.mjs','src/data.mjs','LEADERBOARD_SETUP.md','supabase/migrations/202610170001_leaderboards.sql','supabase/functions/submit-score/index.ts','assets/decor/haunted-hero.webp','.github/workflows/pages.yml']
for name in required: assert (P/name).is_file(),name
html=(P/'index.html').read_text();js=(P/'src/app.mjs').read_text();css=(P/'styles.css').read_text();workflow=(P/'.github/workflows/pages.yml').read_text()
assert html.count('rel="stylesheet"')==1 and 'styles.css?v=2.7.0' in html
assert 'app.mjs?v=2.7.0' in html
assert 'function leaderboard()' in js and 'function howTo()' in js and 'function faq()' in js
assert 'gtp27-mode-grid' in css and 'gtp27-classic-banner' in js
assert "['classic', 'pixel', 'quote', 'ability', 'emoji']" in (P/'src/engine.mjs').read_text()
assert 'mapGame(' not in js and 'data-mode="map"' not in js
assert not any((P/name).exists() for name in ['MEDIA_STUDIO.html','src/maps.mjs','src/map_runtime.mjs','src/announcer.mjs','assets/game-bg/map.svg'])
assert Image.open(P/'assets/decor/haunted-hero.webp').size[0]>=1200
assert not (P/'src/concept_map_manifest.mjs').exists()
assert len(list((P/'assets/sfx').glob('*.wav')))==13
for sound in (P/'assets/sfx').glob('*.wav'):
 with wave.open(str(sound)) as wav:assert wav.getnchannels()==1 and .03<wav.getnframes()/wav.getframerate()<.42,sound
assert 'node --test tests/core.test.mjs tests/v27.test.mjs' in workflow
assert 'cp index.html styles.css dist/' in workflow and 'SOURCES_AND_RIGHTS.md' not in workflow
assert 'src/leaderboard_config.mjs' in workflow or 'cp -r src assets dist/' in workflow
assert not any((P/'tests'/name).exists() for name in ['v21.test.mjs','v22.test.mjs','v23.test.mjs','v24.test.mjs','v25.test.mjs','gtp2.test.mjs','v26.test.mjs'])
print('GTP2 V2.7 release validation PASS: 5 modes, 13 nonverbal SFX, 1 CSS, 2 scoreboards, Supabase backend package')
print('Live leaderboard requires Supabase account setup. Portrait hotlinks remain source-dependent.')
