# NOVA V2.6.1 — Clean GitHub Pages deployment (CI hotfix)

1. BACK UP your existing repository or create a fresh one.
2. Extract this ZIP. Copy its files directly to repository root, preserving `.git` if updating.
3. IMPORTANT: Delete old version files in the repository root: `pinkshift.css`, `dark-pink-v23.css`, `eclipse-v24.css`, `lightshift-v25.css`, old `MEDIA_STUDIO.html`, `MEDIA_DIAGNOSTIC.html`, and `src/announcer.mjs` plus any stale `assets/announcer` folder. They are no longer referenced.
4. Run **`INSTALL_CLEAN_WINDOWS.bat` in your actual repository folder** (or `python3 scripts/clean_old_release.py`). This removes the old test files `tests/v21.test.mjs`, `tests/v23.test.mjs`, `tests/v24.test.mjs`, `tests/v25.test.mjs` and obsolete resources. It preserves `.git`, current tests, save data and user-added Map screenshots.
5. Run `node --test tests/gtp2.test.mjs tests/v26.test.mjs` and `python3 scripts/validate_release.py` before pushing. **Do not run the old V2.1–V2.5 tests.**
6. Commit / Push with GitHub Desktop. Wait for **GTP2 — Test and Deploy GitHub Pages** action to complete.
7. Hard refresh site with `Ctrl + Shift + R`. Page title should report NOVA V2.6.1, and the network should request CSS/JS tagged `v=2.6.1`.

No Media Studio. No automatic downloads of voice actors' clips. Map requires a real photo to load, else disables itself. The build is not a guarantee of copyright immunity.

## Why V2.6 failed in GitHub Actions

The zip overlay left tests from older builds in your repo. `node --test tests/*.test.mjs` executed those old tests alongside NOVA tests. They asserted that removed files such as `pinkshift.css`, `eclipse-v24.css`, `src/announcer.mjs` still exist; they should not. The workflow now explicitly runs only the current game tests and the cleanup script deletes those obsolete tests. **Commit the deletions in GitHub Desktop.**
