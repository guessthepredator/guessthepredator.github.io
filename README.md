# GUESS THE PREDATOR 2 — NOVA V2.6.1

Fan-made static game. Open using a local static server (`python3 -m http.server 8000`) or GitHub Pages.

- Six game modes: Classic, Pixel (composite SCENE reveal), Quote (text only), Ability, Emoji, Map (only if a real screenshot URL successfully loads)
- Dark Mirage-led landing page + light lilac/pink gameplay
- Single `styles.css` bundled in deterministic order; `index.html` and JS module imports all versioned v2.6.0
- All 14 SFX are original, non-verbal. Human announcer and synthetic speech were completely removed.
- Save data uses the existing `guess-the-predator-2:daybreak-v1` key, preserving existing progress.
- Map is a network-dependent experiment: this ZIP does **not** contain authenticated Apex screenshot assets. It is disabled on failure, not spoofed with random art.
- 28 Legend entries still rely on third-party portrait URLs; some may fail depending on the user's connection. Presentation is consistent, poses are not 3D-matched.

See `RIGHTS_AND_GITHUB_AUDIT.md`. Not affiliated with or endorsed by EA or Respawn.

- CI hotfix: stale V2.1–V2.5 tests are removed by cleanup; GitHub Actions runs the current test suites explicitly.
