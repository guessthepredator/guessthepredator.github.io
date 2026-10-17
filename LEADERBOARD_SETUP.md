# Global public leaderboards — setup

The ZIP contains the database schema, secure submission function, frontend UI and tests. **The live database is not created by extracting a ZIP or pushing to GitHub Pages.** You must provision your own Supabase project.

1. Create a project at https://supabase.com/dashboard . Open SQL Editor and execute `supabase/migrations/202610170001_leaderboards.sql`.
2. In Supabase Authentication > Providers/Settings, enable **Anonymous Sign-ins**. Configure captcha / abuse protection as appropriate.
3. Install the Supabase CLI, sign in and link your Supabase project. Deploy `supabase functions deploy submit-score --use-api --no-verify-jwt` from the repository root. The function verifies the user JWT itself using `auth.getUser` and never trusts browser-provided points. Confirm function environment secrets `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are available (Supabase normally provides them). Enable CORS for the Pages origin if you customize the code.
4. Enter **only** your Supabase project URL and publishable key in `src/leaderboard_config.mjs`. Commit those public values and push to GitHub Pages. Never commit `service_role`, database password, or `sb_secret_...` key.
5. Visit the Leaderboard tab, complete all five Daily puzzles and choose a public nickname to submit once per UTC day. Overall totals update across days under the same anonymous browser identity.

**Security model:** RLS denies direct table writes; public rankings expose only nicknames and scores through constrained SQL functions. The Edge Function verifies authenticated anonymous identity, five completed rounds, targets and score bounds before insert, one entry per user per day. Nonetheless, as puzzle logic and answers are client-visible, a determined adversary could fabricate plausible guesses or create new anonymous accounts. This is a **casual leaderboard, not a tamper-proof competition**. Enabling Supabase Auth CAPTCHA / rate limits and adding server-initiated challenge state is recommended before prizes or competitions.

**Privacy:** displayed nickname and score are public. Do not use real names or contact details. Anonymous login in this prototype persists only in the current browser and device. Clearing storage can lose the link to the account.

**Local preview:** rankings show an honest `NOT CONNECTED` message until URL and publishable key are configured. The five game modes, private history, wheel and FAQ still function offline.
