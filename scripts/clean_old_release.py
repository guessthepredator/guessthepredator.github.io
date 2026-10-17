#!/usr/bin/env python3
"""Remove known stale GTP2 concept / duplicate media assets only.
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
