# The Apex Challenge V2.18 — Deployment

1. Extract the complete ZIP and copy **its contents**, including hidden `.github/`, into `guessthepredator/guessthepredator.github.io`. Do not wrap these files in another directory.
2. `Commit` and `Push` to `main` (or upload the contents via the GitHub repository). A **new** GitHub Actions run should trigger automatically; avoid Re-run jobs on an old run with a duplicate `github-pages` artifact.
3. Confirm `The Apex Challenge — Test and Deploy` is green. Check `https://guessthepredator.github.io/`, use Ctrl+Shift+R if needed.
4. Test Daily (Full Scan first), Free Play, the two checkpoint buttons, Rankings, and Legend of the Day in the live browser.

The Supabase Edge Function `submit-score` was separately deployed as ACTIVE version 5 and supports V2.18 in addition to older clients. GitHub Actions deploys **only static files**; it does not update Supabase code. The project publishable key remains in `src/leaderboard_config.mjs` and no service-role credential belongs in this repository.

For full-body portraits read `assets/portraits/README.md`. Original remote images can fail depending on their host. All existing game logic and original sources remain as fallback.
