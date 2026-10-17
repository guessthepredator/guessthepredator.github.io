# V2.10 — CLUE DECK UI FIX

- **Emoji:** Redesigned into a dark, responsive 5-slot decryption panel. Three symbols show initially; further symbols reveal progressively. Per-symbol tiles use light lilac to keep naturally dark emoji readable without brightening the whole gameplay screen. Added a visible unlock progress track and correct completion message.
- **Ability:** New dark scan board, centered large frame for the actual bundled ability icon, no unrelated placeholder drawing. Current eight local PNG icons are preserved.
- Removed inherited circular overlays and pastel screens from both modes through strictly-scoped CSS overrides.
- Updated `index.html` CSS/JS cache keys to `2.10.0`, which also fixes the V2.9 entry HTML still using V2.8 cache keys.
- Nickname prompting/saving, Daily and Overall Supabase configuration, Classic, Pixel, Quote, Free Play, and other features remain as in V2.9. Map remains removed.
- Scope: **visual frontend patch only**. No database writes, migrations, or Edge Function updates.

## Verification
- Node module syntax checks, 26 current tests, release validator, Chromium offline desktop (1440px) and mobile (390px), 5 emoji tokens and 1 ability icon frame.
- The actual Supabase `gtl` project was checked on 2026-10-17: the Daily and Overall leaderboards each contained one score (nickname `Test`, 2,200 points). No new score was submitted for QA.
- Offline Chromium cannot reach live artwork/network here; ability icon visibility was checked using the **same bundled local PNG** injected only into the QA preview, not into runtime code.

## Installation
Unzip into the existing GitHub Pages repository **root** (the folder that contains `.git`); replace matching files, run `INSTALL_CLEAN_WINDOWS.bat`, commit and push. Do not upload the enclosing extracted folder as a subfolder. Refresh with Ctrl+Shift+R and check the header reads `CLUE DECK · V2.10`.
