# NOVA V2.6.1 CI fix report

Root cause: older `tests/v21.test.mjs`, `v23.test.mjs`, `v24.test.mjs`, and `v25.test.mjs` remained after a ZIP overlay and were executed by the old wildcard GitHub Actions command. These tests expected intentionally removed stylesheets and announcer code, causing 11 unrelated failures.

Fixes: `pages.yml` targets `tests/gtp2.test.mjs` and `tests/v26.test.mjs` explicitly; `scripts/clean_old_release.py` removes known obsolete tests; `INSTALL_CLEAN_WINDOWS.bat` deletes obsolete tests using Windows built-in commands, with optional Python cleanup, so deletions can be committed; `index.html` updates CSS and JS cache keys together.

Compatibility: same data modules and local save key; no gameplay/media changes.

Publish: extract over the current repo, run cleanup inside the repo, verify deleted test entries in GitHub Desktop, commit all changes, push. Do NOT delete `.git`.
