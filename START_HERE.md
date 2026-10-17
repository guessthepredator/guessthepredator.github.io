# GTP2 V2.5 · Clean-install checklist

1. Back up your existing project. Unzip this file directly into the repository root while keeping the hidden `.git` folder intact.
2. Run `INSTALL_CLEAN_WINDOWS.bat` on Windows or `python3 scripts/clean_old_release.py` in the repository root. This deletes obsolete fake Map renders, Media Studio, generic figure files, and old entry SFX, not your `.git` folder.
3. Test with `python3 scripts/validate_release.py` and `node --test tests/*.test.mjs` (requires Python Pillow and Node).
4. Local preview: `python3 -m http.server 8000`; open `http://localhost:8000/`. Do not double-click `index.html` using `file://`.
5. GitHub Desktop: confirm obsolete files are actually shown as **deleted**, Commit all changes, Push to `main`. Under repository Settings → Pages, select **GitHub Actions**.

**Map is not guaranteed online.** The launcher checks real POI image URLs. If none load, the Map card is disabled instead of showing made-up pictures, and five core daily missions remain. The ZIP contains no official Map screenshots and no reliable full set of 28 locally stored portraits.

If you intend to publish this publicly, read `SOURCES_AND_RIGHTS.md` first; these sources have **not** been cleared by EA for a fan game.
