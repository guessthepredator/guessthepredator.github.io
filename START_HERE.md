# Guess The Predator 2 — V2.3 Dark Pink Reforged

## Recommended: a CLEAN GitHub repository
1. Extract the ZIP. Root must directly contain `index.html`, `src/`, `assets/`, `styles.css`, `pinkshift.css`, `dark-pink-v23.css`, `.github/`.
2. For a new repository, copy these files into your new GitHub Desktop repository folder. Do not copy a wrapping folder. Do not delete `.git`.
3. Commit and Push origin. In GitHub Settings → Pages choose **GitHub Actions**.
4. Wait for green Actions; reload with Ctrl+F5.

## Upgrading an old repository
Windows copy/paste does NOT delete files that were in older versions. Before commit run:
`python3 scripts/clean_old_release.py`
This deletes only old `src/concept_map_manifest.mjs`, `assets/maps/*-concept-*.webp`, `assets/legends/*.webp`, `assets/sfx/enter-*.wav`, and old duplicate artwork. It will NOT touch `.git` or your real map captures. **Review the GitHub Desktop Changes tab and commit deletions.** The Pages workflow also prunes stale content from the deployment working tree, but that does not remove it from the Git repository history.

## Human voice announcer (CC0)
The GitHub Actions deployment attempts to download Kenney's CC0 Voiceover Pack, and install suitable REAL human-spoken OGG files. If its server cannot be reached, the build stays online and the announcer is unavailable; no robotic replacement is used. The ZIP itself does NOT contain these recordings because download access was unavailable in the build environment.

To bundle and commit voices reliably, visit https://kenney.nl/assets/voiceover-pack, download the original archive, then execute:
`python3 scripts/install_cc0_announcer.py "Voiceover Pack.zip"`
Commit the resulting `assets/announcer/*.ogg` and `assets/announcer/manifest.json`. These clips are CC0 *game announcer* phrases, not the voices of the 28 Legends. Quote remains text-only; doing otherwise would falsely associate unrelated actors with the characters.

## Game maps and character portraits
All 36 POIs have **unique, local original schematic visual clues** in `assets/map-recon/`, and they work offline. These are NOT real screenshots. For better real visual recognition you can add authorized screenshots through `MEDIA_STUDIO.html`; local screenshots always supersede schematic clues.

Browse Legends uses REAL character portrait URLs from prior versions; no generic AI substitutes have been inserted. Some images can fail because of third-party hosts. The ZIP contains NO 28 locally licensed full 3D renders; do not describe this part as independently guaranteed offline.

## Run tests
`node --test tests/*.test.mjs`
`python3 scripts/validate_release.py`
Requires Python Pillow (Actions installs this). Chromium browser checks live in `tests/browser_qa.py` and `tests/v23_browser_media_qa.py`.

## Legal
Read `RIGHTS_AND_GITHUB_AUDIT.md` before publicly hosting. This game is unofficial; EA's current content policy restricts fan games and use of third-party voice content. CC0 game-announcer audio does not grant permission for EA imagery, characters, or to publish a fan game.
