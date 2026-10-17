# Guess The Predator 2 · Lightshift V2.5 (Test Build)

An independent, unofficial browser quiz project with dark-pink Mirage-inspired home screen, lighter pink-lilac in-game screens, Daily / Free Play, 28 Legend roster records, five standard modes, and **Map as a conditional bonus mode**.

## Installation

Extract the ZIP at the **root of your existing repository** (same level as `index.html`) while preserving `.git`. Run `INSTALL_CLEAN_WINDOWS.bat`, or `python3 scripts/clean_old_release.py` from the repo root. Review changed/deleted files in GitHub Desktop; Commit then Push. GitHub Pages must be configured for GitHub Actions. Preview locally using `python3 -m http.server 8000`, then browse `http://localhost:8000`.

## Map quality gate (important)

**There are zero bundled Apex POI screenshots.** Map Mode uses documented external Apex Wiki file addresses but will **only open after at least one real location image loads successfully in the player's browser**. The game never silently replaces that image with unrelated concept art, an invented building, or a schematic. If every external image fails, Map is disabled. The other five game modes remain playable and the daily mission denominator becomes 5. If at least one Map screenshot loads, Map is available and the denominator becomes 6. Availability can differ per device / network.

This is intentionally a **test build**, not a guarantee that remote Wiki links are permanently accessible, legally approved, or visually perfect. Rights remain unverified for public fan-game display. See `SOURCES_AND_RIGHTS.md`.

## Other changes

- Free Play has **START FREE PLAY**, not the misleading CONTINUE DAILY button.
- The whole gameplay background uses a pastel pink/lilac/cyan palette. Homepage stays dark.
- Pixel Mode's **SOFT BLUR** button works; blur strength progresses smoothly, Mosaic uses raster pixels, Signal is softer. Complete pose is fitted without forced face cropping.
- Browse Legends has consistent panel geometry and `object-fit: contain`. **The source artwork itself still has different poses**, because official matching 3D renders are not included. Remote images may fail; a neutral text fallback is shown.
- 14 locally bundled replacement WAV effects: gentle taps instead of harsh sweeps. UI sound and optional CC0 human announcer can be toggled. Real announcer clips are **not bundled in this ZIP**; automatic download at deploy is optional and may fail.
- Quote is written text; there are no synthesized Legend imitations.

## Tests

```bash
python3 -m pip install Pillow
python3 scripts/validate_release.py
node --test tests/*.test.mjs
python3 tests/make_browser_harness.py
python3 tests/e2e_lightshift.py
```

The two browser harness scenarios are **offline** and **simulated image success**; the success image is labeled QA-only, and is never part of the release. No test in this environment verifies public-network Wiki loading or grants any image rights.

This project is **not endorsed by or affiliated with EA or its licensors**. EA's content policy restricts fan games. Review the risk notice before public deployment.
