# V2.7 QA Report

**Automated (local):** `node --test tests/core.test.mjs tests/v27.test.mjs` → 14/14 pass; `python3 scripts/validate_release.py` → PASS; `node --check` applied to current JS modules.

**Chromium offline harness:** 1600×900 and 390×844. All 5 homepage mode cards rendered. FAQ contained 9 entries; How to Play showed 5 modes; Rankings displayed not-configured state; Classic question banner and five scanner cells visible; Pixel displayed three effect presets. No uncaught JS errors in the tested flows.

**End-to-end in offline Chromium:** Completed each of the five Daily puzzles in one guess, opened rankings → local BASE 7,300, streak bonus 365, local total 7,665; no page errors.

**Not tested:** real GitHub Pages deployment, remote Apex portrait availability, actual Supabase project, Edge Function deployment and database transactions. These are separate operational checks once a project/account is connected. Supabase Edge TS was reviewed but cannot be executed end-to-end without the external service.

**Risks/constraints:** public leaderboard with anonymous login is not fully cheat-proof. External Legend portraits can be unavailable. SFX taste is subjective and should be auditioned by the owner.
