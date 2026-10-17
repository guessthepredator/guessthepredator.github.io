# QA scope — V2.5

- `node --test tests/*.test.mjs`: 30 Node tests passed.
- `python3 scripts/validate_release.py`: passed.
- Offline Chromium tests: 1600×900 and 390×844; no JavaScript exceptions in the tested flows.
- Map **offline condition**: button disabled and core daily counts adjusted.
- Map **success simulation**: one QA-only 800×450 image pre-verified and displayed; Map flow opens normally.
- Free Play button says **START FREE PLAY**, not Continue Daily.
- Pixel Soft Blur button is selectable; darker gameplay background is replaced with light canvas.

Not verified in this environment: remote Wiki image URLs in real browsers, full real Legend portrait availability, reception/taste of SFX by users, actual deployment of optional Kenney audio, or copyright permission.
