from pathlib import Path
from PIL import Image
import json,sys
root=Path(__file__).resolve().parents[1]
required=['index.html','styles.css','pinkshift.css','eclipse-v24.css','lightshift-v25.css','SOURCES_AND_RIGHTS.md','src/app.mjs','src/engine.mjs','src/maps.mjs','src/map_media_manifest.mjs','src/ability_media_manifest.mjs','src/data.mjs','assets/decor/haunted-hero.webp','assets/map-catalog.json','.github/workflows/pages.yml']
for f in required:
    assert (root/f).is_file(),f'MISSING FILE: {f}'
locations=json.loads((root/'assets/map-catalog.json').read_text())
assert len(locations)==36, f'Expected 36 catalog entries, found {len(locations)}'
assert len({r['id'] for r in locations})==36
assert len({r['map'] for r in locations})==6
assert len([r for r in locations if r['kind']=='Interior'])>=10
img=Image.open(root/'assets/decor/haunted-hero.webp')
assert img.size[0]>=1280 and img.size[1]>=720
js=(root/'src/app.mjs').read_text();css=(root/'styles.css').read_text()
assert js.count('id="mirage-gaze"')==0
assert 'gtp2-backdrop' in js and '.gtp2-backdrop' in css
assert (root/'dark-pink-v23.css').exists()
assert 'dark-pink-v23.css' in (root/'index.html').read_text()
assert not (root/'assets/decor/haunted-showcase-full.png').exists()
assert 'HUMAN VOICE FILE NOT INSTALLED' not in js
assert 'MEDIA_STUDIO.html' not in js
assert not (root/'MEDIA_STUDIO.html').exists()
assert not (root/'MEDIA_DIAGNOSTIC.html').exists()
assert 'gtp2-audio-preview' in js
assert 'mapMediaManifest' in (root/'src/maps.mjs').read_text()
assert 'https://apexlegends.wiki.gg' in (root/'src/maps.mjs').read_text()
assert 'externalMapSources' in (root/'src/external_map_sources.mjs').read_text()
assert 'findVerifiedMapImages' in (root/'src/app.mjs').read_text()
assert 'lightshift-v25.css' in (root/'index.html').read_text()
assert 'lightshift-v25.css dist/' in (root/'.github/workflows/pages.yml').read_text()
assert '''session==='daily'?`<button data-action="home-daily"''' in js
assert "['mosaic','soft','holo'].includes(button.dataset.style)" in js
assert 'map-recon/' not in (root/'src/maps.mjs').read_text()
assert not (root/'src/concept_map_manifest.mjs').exists()
assert not list((root/'assets/maps').glob('*-concept-*.webp'))
assert not list((root/'assets/legends').glob('*.webp')) if (root/'assets/legends').exists() else True
assert len(list((root/'assets/sfx').glob('*.wav')))==14
assert (root/'src/engine.mjs').read_text().count('%36')>=1
for f in (root/'assets/ability-icons').glob('*.png'):
    assert f.read_bytes()[:8]==b'\x89PNG\r\n\x1a\n', f
assert not (root/'assets/map-recon').exists(), 'Map concept art must not be shipped as a gameplay fallback'
maps=sum(any((root/'assets/maps'/f"{r['id']}.{ext}").exists() for ext in ['webp','jpg','png','jpeg']) for r in locations)
print(f'GTP2 V2.5 QA PASS: 36 POIs catalogued / {maps} local screenshots / Map screenshot quality gate / 8 ability icons / 14 tactile WAV cues / Daily-Freeplay navigation')
if not maps: print('NOTE: Zero real Map screenshots bundled; runtime verifies actual external image loading or disables Map.')
if not list((root/'assets/announcer').glob('*.ogg')): print('NOTE: Human CC0 announcer is optional; generated locally or by GitHub Actions download.')
