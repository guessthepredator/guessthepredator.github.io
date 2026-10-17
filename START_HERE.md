# NOVA V2.6 — Clean GitHub Pages deployment

1. BACK UP your existing repository or create a fresh one.
2. Extract this ZIP. Copy its files directly to repository root, preserving `.git` if updating.
3. IMPORTANT: Delete old version files in the repository root: `pinkshift.css`, `dark-pink-v23.css`, `eclipse-v24.css`, `lightshift-v25.css`, old `MEDIA_STUDIO.html`, `MEDIA_DIAGNOSTIC.html`, and `src/announcer.mjs` plus any stale `assets/announcer` folder. They are no longer referenced.
4. Delete stale concept image files via `python3 scripts/clean_old_release.py` (leaves real user screenshots and `.git` untouched).
5. Run `node --test tests/*.test.mjs` and `python3 scripts/validate_release.py` before pushing.
6. Commit / Push with GitHub Desktop. Wait for **GTP2 — Test and Deploy GitHub Pages** action to complete.
7. Hard refresh site with `Ctrl + Shift + R`. Page should report V2.6 in title AND nav subtitle.

No Media Studio. No automatic downloads of voice actors' clips. Map requires a real photo to load, else disables itself. The build is not a guarantee of copyright immunity.
