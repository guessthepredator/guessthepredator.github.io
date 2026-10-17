# Supabase connected · GTP2 V2.7.1

Project: gtl (`pupdfltjeyzhnyrxutvt`), Europe West.

**Already deployed in Supabase**
- Public table `gtp_daily_scores` with RLS; no direct browser writes.
- RPCs `get_daily_leaderboard`, `get_overall_leaderboard` return only display names and scores.
- Edge Function `submit-score` was deployed to the Supabase project on 2026-10-17. Its `verify_jwt` gateway option is OFF because the function itself validates the user's bearer token with Supabase Auth. CORS restricts browser Origins to `https://negoitasebastian.github.io` and localhost.

**What you still need to check:** Enable anonymous sign-ins under Supabase Authentication, if not already enabled. Browser must have network access to `esm.sh` (dynamic supabase-js dependency) and Supabase. We have not run a real anonymous sign-in and completed score submission.

To publish: copy this repository into your existing GitHub repository, run `INSTALL_CLEAN_WINDOWS.bat`, review GitHub Desktop changes (keep `.git`), then Commit and Push. No new Supabase project and no secret credentials are necessary.

**Important:** The daily targets are deterministic and public in the game code. Server validation helps reject malformed or altered scores but this remains a casual, not cheat-proof leaderboard. The function was deployed from a hardened server implementation; do not run an older `supabase functions deploy` command from earlier ZIPs, which would overwrite it. See `LEADERBOARD_SETUP.md`.
