# V2.20 — Apex Trivia Expansion

- Added **TRIVIA** tab beside Home (and to both desktop/mobile navigation systems).
- Independent Daily Ranked and Practice rounds: **5 questions × 20 seconds**, **20 points per correct answer** (maximum 100).
- 91 official-EA-sourced questions cover classes, tactical ability names, maps, typed Legend names, and class-based odd-one-out.
- Server-owned answer key and server-validated time/score; answers are not bundled in the public repository.
- After each submitted answer, a short explanation and official source link are shown. The timer does not advance until the player requests the next question.
- Independent Trivia Daily/Overall rankings using Supabase SQL RPCs, separate from deduction game leaderboards. Existing scores are unchanged.
- New responsive neon Trivia interface, countdown progress bar, feedback, result screen and rankings sidebar.
- Maintains all existing V2.19 game art, Daily/Free Play mechanics, and full-body portrait fallbacks.

**Deployment:** Supabase project `pupdfltjeyzhnyrxutvt` already has migrations applied, a private 91-question catalog, and 3 RPC functions. Push the contents of this ZIP to GitHub to publish the tab. No source code from the private answer key is in the ZIP.

**Test scope:** Node regression suites + Chromium offline-mocked UI flows (desktop and mobile). No public live score submission was performed.
