# Guess The Predator 2 — V2.2.1 Emergency Restoration

**What was deliberately rolled back:**
- Character artwork: removed all 28 generic stand-in figures; original recognisable portrait catalogue from V2.1 is used again. Those portraits are externally hosted and may still fail; they are not locally bundled.
- Map: removed 72 generic concept pictures and disabled their misleading POI mapping. With no approved true screenshots added, the game displays a written clue. The 36-location catalogue and Media Studio still work.
- Audio: removed the six new entry stingers; restored navigation sound from V2.1. Other pre-existing UI sounds remain.
- UI: reverted Pinkshift 2.0's heavy game-scene/picker overrides to the earlier Pinkshift CSS, while keeping Quote text-only.

**Limits:** This is a targeted rollback, NOT the promised map-media solution. It does not bundle official Apex Legend portraits. External artwork has availability and rights risks. This patch does not certify EA/GitHub policy compliance.

**Deploy over existing GitHub repo:** First back up your work. Copy root-level files from this ZIP to the repo. **Delete** old folders/files `assets/legends/`, `assets/maps/*-concept-*.webp`, `src/concept_map_manifest.mjs`, and `assets/sfx/enter-*.wav` from the repo; merely copying files doesn't delete old files. Keep your `.git` folder intact. Commit, push, verify GitHub Actions, hard-refresh. If you prefer the safest full rollback, use GitHub Desktop History → Revert the V2.2 commit and Push.
