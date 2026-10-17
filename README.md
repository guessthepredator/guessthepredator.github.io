# Guess the Predator 2 — Pinkshift Eclipse V2.4

Independent, unofficial six-mode browser trivia. English UI, no player account required.

## Installation

Extract all files into the repository root (where `index.html` lives), **not** into a subfolder. Keep `.git`. Run `python3 scripts/clean_old_release.py` once in the repo root to delete old Media Studio pages, concept renders, and legacy SFX. `git add -A`, commit, push to `main`, then enable GitHub Pages via Actions.

Run checks locally:

```bash
python3 scripts/validate_release.py
node --test tests/*.test.mjs
python3 -m http.server 8000
```

## What you receive

Six interactive modes, Daily and Free Play, 28 Legend roster records, Pixel with Mosaic / Soft Blur / Signal, text Quote, 36 Map POIs, eight locally bundled Ability icons, original 14-file short SFX deck, original local background artwork, accessibility motion toggle, Daily streaks and reward.

**Map screenshots:** For POIs with documented screenshots, `src/external_map_sources.mjs` points to third-party-hosted Apex Wiki file URLs. These are not downloaded or bundled. If a link fails, the playable mode falls back to an *explicitly labeled* local schematic clue. No copyright permission is claimed for wiki files; see `SOURCES_AND_RIGHTS.md` before publishing.

**Legends:** Portraits are requested from external hosts and may be blocked; the project does **not** claim to bundle 28 full official renders. Failed requests display a clean 'visual unavailable' state instead of a broken-image icon. CSS scales available art without stretching.

**Voice:** Quote uses written original fan clues. The optional Kenney CC0 human announcer integration only plays existing licensed recordings; no synthetic/robotic dialogue or impersonations. When files are not available, the UI stays quiet and playable.

## Policy warning

EA's present content policy restricts fan games and warns against implying endorsement. A repo can still receive an IP complaint. See `SOURCES_AND_RIGHTS.md` for citations and issues. "Not endorsed by EA" is a disclosure, not a license. Do not represent these materials as officially approved for use in a fan game.
