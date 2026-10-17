# NOVA V2.6 QA record

- 14/14 Node regression tests pass.
- All src/*.mjs syntax checks pass via Node.
- Release validator passes: 1 CSS, 14 original WAVs, no announcer dependency, 36 map catalog entries, no misleading local concept map images.
- Chromium **inline offline** harness at 1600×900 and 390×844: home 6 mode tiles, Pixel scene with isolated QA fixture image, Mosaic/Soft Blur buttons, Browse 28 entries. No JS page errors in those flows. Game backgrounds and headings verified via computed CSS.
- QA fixture was never included in this release ZIP; production uses external legend portrait URLs. Browser-level live imagery and licensed map screenshot availability were **not** verified.
- Map remains network-gated; if images fail to load, Map is disabled rather than displaying unrelated art.
- User's real deployed GitHub Pages instance not modified, inspected, or tested in this run.
