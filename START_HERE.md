# V2.7 Mirage Edition — clean install in your existing GitHub repository

1. Back up the repository folder. **Do not delete `.git`** or create a new repository.
2. Extract this ZIP into the repository's **root**, replacing matching files. The archive contains `index.html` at root.
3. Run `INSTALL_CLEAN_WINDOWS.bat` from the repository folder (or `python3 scripts/clean_old_release.py`). This removes old Map files, incompatible old tests and discarded themes. Copying over existing files alone **does not remove obsolete ones**.
4. In GitHub Desktop, review the **Deleted** files (old Map, tests, stylesheets). Commit all tracked modifications and deletions, then Push Origin.
5. In GitHub > Actions, wait for `GTP2 — Test and Deploy GitHub Pages` to complete. The website should report **MIRAGE EDITION · V2.7** and request `styles.css?v=2.7.0` and `app.mjs?v=2.7.0`.
6. Refresh the browser with `Ctrl + Shift + R` if the previous version was cached.

## Global rankings (separate step, required)
GitHub Pages cannot host shared player scores by itself. To activate the actual **Daily** and **Overall** online rankings, follow `LEADERBOARD_SETUP.md` to create a Supabase project, run SQL, deploy the Edge Function, enable anonymous sign-in, and enter **public** URL/key in `src/leaderboard_config.mjs`. Do **not** place a service-role or secret key in GitHub Pages.

Until then, all five modes work and personal scores are calculated locally; the Rankings screen shows `NOT CONNECTED` instead of pretending players are already online. Deploying the frontend alone is **not** equivalent to installing a database.

## Local tests

```sh
node --test tests/core.test.mjs tests/v27.test.mjs
python3 -m pip install Pillow
python3 scripts/validate_release.py
```

Tests also run on every push in GitHub Actions. New changes preserve the original local progress key; incomplete historical Map rounds are ignored by the five-mode daily streak.
