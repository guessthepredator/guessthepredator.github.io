# GTP2 V2.8 TWILIGHT · install on the SAME GitHub repository

1. Make a backup of your current repository. Keep its `.git` folder.
2. Copy all files/folders from this ZIP to the **root** of your existing repository and choose Replace.
3. Run `INSTALL_CLEAN_WINDOWS.bat` **in the repository root** to remove old Map resources and test files.
4. In GitHub Desktop review changes **and deletions**, Commit to main and Push origin.
5. Wait for the GitHub Actions workflow to turn green, open GitHub Pages, and use Ctrl + Shift + R. Website files should request `styles.css?v=2.8.0` and `src/app.mjs?v=2.8.0`.

### Rankings
Supabase project `gtl` is **already provisioned** with two public read functions and the active `submit-score` Edge Function. URL + public publishable key are already in `src/leaderboard_config.mjs`. **Do not rerun the old migration or redeploy the historical Edge source in this ZIP.** Ensure Supabase Dashboard → Authentication → Anonymous Sign-ins is enabled.

To test: open Rankings (should show an empty, not disconnected board), complete five Daily puzzles, enter a **gamer nickname, not your real name**, and submit. One successful entry should appear on both Daily and Overall. No fake players are preloaded. See `LEADERBOARD_SETUP.md`.

Local CI checks:

```sh
node --test tests/core.test.mjs tests/v27.test.mjs tests/v28.test.mjs
python3 scripts/validate_release.py
```

The store key is unchanged so current browser progress is preserved. Frontend ZIP deployment by itself does not alter your Supabase project.
