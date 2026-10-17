# Apex Trivia: source review and rules (2026-10-17)

The canonical 91-question bank (including accepted answers) lives **only** in the private Supabase table `public.gtp_trivia_questions`. A key-free manifest of IDs/categories/sources is bundled at `tests/trivia_public_manifest.json`. Do not commit answer keys to the public GitHub repository. The game API sends prompts/options only until a timed answer has been submitted. All questions are backed by primary EA/Respawn sources:

- Official EA Legend guide: https://help.ea.com/sv/articles/apex-legends/abilities/
  - Current classes for 28 playable Legends, their named tactical abilities, and basic class identity. Page accessed on 2026-10-17.
- EA Apex character hub: https://www.ea.com/games/apex-legends/apex-legends/game-objects/characters-hub
  - Class/roster cross-check for current Legends.
- EA Apex map directory: https://www.ea.com/games/apex-legends/apex-legends/game-objects/maps-hub
  - Current official map names.

**Question categories**: 28 class classification, 28 tactical identification, 12 odd-one-out class questions, 9 typed/name questions, 8 map identification questions, 6 class/basic knowledge questions; total **91**.

**Rules**: Five server-selected questions; fixed categories mix; 20 seconds per question (server time), 20 points for a correct answer (100 max). After each answer the timer stops until the user starts the next question. Accepts lowercase, uppercase, spaces, punctuation variants. Daily has the same selection for everyone and is once per UTC date per anonymous account. Practice is unlimited, does not appear on the global rankings. Only the scored Daily results count in independent Daily and Overall Trivia leaderboards.

**Maintainability**: Live service games are updated frequently. Do not claim this bank remains perfectly accurate after balance/class/roster updates. Review it against EA on a cadence and disable stale questions by setting `active=false` in the private table until reverified.

**Deployment**: The `202610170002`, `202610170003`, and `202610170004` database migrations must be applied before uploading the GitHub Pages front end. In the connected project `pupdfltjeyzhnyrxutvt`, all 91 questions and their authenticated server endpoint have already been deployed.
