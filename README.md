# Guess The Predator — Final Visual Lock (V2.19)

Final design pass built on the working V2.18 dual-Daily system. Homepage now uses a new **clean two-Mirage artwork background** (no pre-painted UI), and all buttons, progress bars, mode tiles and labels are actual responsive HTML/CSS.

- Five independent gameplay modes: Classic, Pixel, Quote, Ability, Emoji
- Two Daily rounds: Full Scan then One Signal, rotated through five modes
- Two reward checkpoints, Free Play, Next Game Legend wheel
- Global leaderboard through the already connected Supabase score function v5 (not reset)
- On the gameplay screen, theme accents across both cards, navigation, terminal and controls
- Browse Legends uses uniform transparent card frames and a local-first image loader

**Limitation:** This build does **not** include the missing ten verified full-body transparent Legend renders. See `PORTRAIT_ASSET_AUDIT.md`. No fake, misidentified or square images were relabeled as full-body. Existing authentic remote sources remain fallback.

## Deploy
Copy the extracted *contents* into the root of `guessthepredator.github.io`, including `assets/decor/mirage-clean-final.webp`, `.github`, `src`, `tests` and `styles.css`. Commit/push once. Deployment runs on GitHub Actions; do not simply rerun the existing workflow if the files are not committed. After it succeeds, hard refresh.

Local validation: `node --test tests/*.test.mjs` and `python3 scripts/validate_release.py` (requires Pillow).

Fan website, not an official EA or Respawn product. Art rights belong to their respective owners.


## V2.20 — Timed Apex Trivia

A separate TRIVIA navigation tab provides Daily Ranked and unlimited Practice. Each round has five questions at 20 seconds per question, scoring 20 points each for a maximum of 100 points. The Daily and Overall Trivia leaderboards are separate from the main deduction-game leaderboard.

**Supabase status:** Project `pupdfltjeyzhnyrxutvt` already has all 91 curated questions in a private table, the scoring RPC, and separate ranking RPCs. The answer bank is deliberately **not** included in this public GitHub repository. Do not upload quiz answer keys.

Apply the three Trivia migrations in `supabase/migrations/` if setting up a new Supabase project; then seed a privately held answer bank as documented in `TRIVIA_SOURCES.md`. This repository alone cannot create the private bank for an entirely new project.
