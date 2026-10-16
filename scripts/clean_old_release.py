#!/usr/bin/env python3
"""Remove known stale GTP2 concept / duplicate media assets only.
Will NEVER delete .git, real maps, or other user-provided files.
"""
from pathlib import Path
R=Path(__file__).resolve().parents[1]
paths=[R/'src/concept_map_manifest.mjs',R/'assets/decor/haunted-showcase-full.png']
paths+=list((R/'assets/maps').glob('*-concept-*.webp'))
paths+=list((R/'assets/legends').glob('*.webp')) if (R/'assets/legends').exists() else []
paths+=list((R/'assets/sfx').glob('enter-*.wav'))
for p in paths:
 if p.is_file():
  p.unlink();print('REMOVED',p.relative_to(R))
print('Clean release: stale concept assets pruned; real map captures and .git preserved')
