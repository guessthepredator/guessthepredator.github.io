# V2.8 live project · Supabase

Project **gtl** (`pupdfltjeyzhnyrxutvt`). Live URL and the public publishable key are already configured in `src/leaderboard_config.mjs`. Database table + two RPC leaderboard readers + hardened `submit-score` Edge Function were provisioned in the connected Supabase project on 2026-10-17.

**IMPORTANT: Do not rerun the legacy migration or deploy the old function source included here.** The live `submit-score` function has already been updated to check bearer identity and challenge submissions. Old source is historical and is not automatically deployed via GitHub Pages.

The only required user setup check is **Supabase Dashboard → Authentication → Anonymous Sign-ins: enabled**. Configure rate limits and CAPTCHA if public abuse occurs.

Website deploy: unzip over the same GitHub repository (keep `.git`), run `INSTALL_CLEAN_WINDOWS.bat` from the repository folder, then Commit → Push in GitHub Desktop. Supabase does not need a new project and no secret key belongs in GitHub.

**Acceptance test:** open your GitHub Pages site; visit Rankings; both public boards should load and initially show no scores. Complete the five Daily modes today, type an anonymous nickname (not real name), submit once, then confirm it appears on Daily and Overall. Submissions require a valid anonymous session and use the live backend. Browser/API live E2E has not yet been verified.

The local game code includes deterministic answers and cannot prevent determined manipulation. Treat the leaderboard as casual, not competition-grade security.

