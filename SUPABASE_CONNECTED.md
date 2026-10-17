# Supabase — Live integration

Project: `pupdfltjeyzhnyrxutvt` (Supabase URL `https://pupdfltjeyzhnyrxutvt.supabase.co`). Frontend publishable credentials are located in `src/leaderboard_config.mjs`.

**Live Edge Function `submit-score`: ACTIVE v5** (updated 2026-10-17). Accepts the official website origin `https://guessthepredator.github.io` (and earlier origin), verifies anonymous Supabase sessions, checks names, date, game answers, hints and Full Scan/One Signal results, requires the correct track order and recalculates all points server-side. The same endpoint accepts legacy five-round payloads during rollout.

Client protocol V2.18: `protocol:'v218'`, `rounds:{full:{gameMode,...},signal:{gameMode,...}}`. Two-round scores normalized by 2.5 for continuity with five-round leaderboard history. Database schema unchanged, with one score per anonymous account and UTC day.

Publishing the GitHub repository DOES NOT redeploy the Supabase Edge Function. The checked-in `supabase/functions/submit-score` folder documents the service-side code. NEVER place the Supabase service-role key in static website files.
