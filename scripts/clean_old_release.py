#!/usr/bin/env python3
"""Remove obsolete GTP2 resources and incompatible tests from older releases.
Will NEVER delete .git, real maps, or other user-provided files.
"""
from pathlib import Path
import shutil
R=Path(__file__).resolve().parents[1]
paths=[R/'src/concept_map_manifest.mjs',R/'assets/decor/haunted-showcase-full.png',R/'MEDIA_STUDIO.html',R/'MEDIA_DIAGNOSTIC.html',R/'ASSET_PROVENANCE_V24.json',R/'MAP_CAPTURE_PLAN.md',R/'QA_REPORT_V2_2.md',R/'ROLLBACK_README.md']
paths+=list((R/'assets/maps').glob('*-concept-*.webp'))
paths+=list((R/'assets/legends').glob('*.webp')) if (R/'assets/legends').exists() else []
paths+=list((R/'assets/sfx').glob('enter-*.wav'))
for p in paths:
 if p.is_file():
  p.unlink();print('REMOVED',p.relative_to(R))
print('Clean release: stale concept assets pruned; real map captures and .git preserved')

# Generated non-game Map reconstructions from earlier patches cannot leak into the new build.
recon=R/'assets/map-recon'
if recon.exists() and recon.is_dir():
 shutil.rmtree(recon)
 print('REMOVED obsolete Map schematic folder')

# Throw away stale QA previews and harnesses from previous releases.
testdir=R/'tests'
if testdir.exists():
 for name in ['browser_harness.html','bundled.js','browser_qa.py','e2e_eclipse.py','v23_browser_media_qa.py','rollback_visual_contract.py']:
  old=testdir/name
  if old.exists():old.unlink();print('REMOVED',old.relative_to(R))
 for old in testdir.glob('v24_*.png'):
  old.unlink();print('REMOVED',old.relative_to(R))

# v2.6 consolidates all legacy CSS and removes the optional voice announcer.
for name in ['pinkshift.css','dark-pink-v23.css','eclipse-v24.css','lightshift-v25.css']:
    stale=R/name
    if stale.is_file():stale.unlink();print('REMOVED old theme:',name)
for name in ['announcer.mjs','voice.mjs','voice_manifest.mjs']:
    stale=R/'src'/name
    if stale.is_file():stale.unlink();print('REMOVED voice module:',name)
for name in ['announcer','voices']:
    stale=R/'assets'/name
    if stale.is_dir():shutil.rmtree(stale);print('REMOVED voice directory:',name)

# These are tests for CSS/audio/modules that intentionally no longer exist.
# GitHub Desktop must track their DELETIONS; just extracting a ZIP never removes them.
for name in ('v21.test.mjs','v22.test.mjs','v23.test.mjs','v24.test.mjs','v25.test.mjs'):
    stale=R/'tests'/name
    if stale.is_file():
        stale.unlink()
        print('REMOVED legacy test:',stale.relative_to(R))
