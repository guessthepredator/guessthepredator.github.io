# GTP2 V2.2 — Actual verification performed

- `node --check src/*.mjs`: module syntax verified (full check run separately).
- `node --test tests/*.test.mjs`: 14 / 14 passing.
- `python3 scripts/validate_release.py`: 36 sectors / 6 maps, 72 original scene WebPs, 28 transparent figure WebPs, 20 original WAVs, one clean hero; 0 actual game screenshots.
- Chromium at 1440×900 and 390×844: all 6 modes open without JS page errors; borderless hero; gaze and FX OFF.
- Chromium Map mode: at least one 960px bundled local artwork loads; Map mode has a local image, not a broken hotlink.
- Chromium Quote: text displayed, no play-voice button.
- Chromium Browse: 28 standardized cards, all 28 local images load without `PORTRAIT OFFLINE`.
- Chromium audio: all 6 new `enter-*.wav` triggers fire on mode click.
- Separate Media Studio multi-asset export was tested in prior 2.1 release; not re-tested here after this patch because its exporter logic was unchanged.

Limitations: no end-to-end real GitHub Pages deployment performed, no live online third-party art verification, no full legal clearance, no official game-asset capture validation. These are **real tests in an isolated headless browser**, not a guarantee of flawless operation on all devices.
