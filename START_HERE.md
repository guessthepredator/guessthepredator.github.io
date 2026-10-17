# START HERE — V2.4 Pinkshift Eclipse

1. Make a backup of your current repo. Extract this ZIP *into the existing repository root*, preserving `.git`.
2. On Windows **double-click `INSTALL_CLEAN_WINDOWS.bat`**, or run `python3 scripts/clean_old_release.py` in the repository root to remove Media Studio, old concept pictures, leftover fake legend art, and old extra sounds. This is vital: extracting ZIPs over a repo does not delete obsolete files.
3. Run `python3 scripts/validate_release.py` and `node --test tests/*.test.mjs`.
4. Preview with `python3 -m http.server 8000`, open `http://localhost:8000/` in a browser. `file://` won't load module imports correctly.
5. In GitHub Desktop, inspect the changed files. Commit and Push. Under repo Settings → Pages, select **GitHub Actions**.

**Map sources:** external wiki screenshots are attempted for some locations with fallback to a labeled schematic. Their rights are not verified for a public fan game; consult `SOURCES_AND_RIGHTS.md` before publishing.

**Do not assume zero missing external character art.** Our graceful fallback is not the same thing as a real 3D render. The optional human announcer uses Kenney CC0 materials and remains silent if unavailable. This build contains no imitated voices.
