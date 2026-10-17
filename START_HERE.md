Guess The Predator V2.14 — LOW GLOW

See CHANGELOG_V214.md for the new look and optional full-body artwork setup.

# Guess The Predator — install

1. Extract this archive. Copy all the extracted files/folders into your EXISTING `guessthepredator.github.io` repository root (alongside `.git`, which should be retained).
2. Commit and Push to `main`. Let GitHub Pages Actions complete.
3. Visit https://guessthepredator.github.io/ and hard refresh with Ctrl+Shift+R.
4. Check Home's five-tile cascade, Rankings/FAQ/How To Play, Origin scanner, Smart Hint green, partial-signal cyan, and Free Play victory confetti/SFX.

Leaderboard data is stored separately in Supabase and isn't erased by this update. The live Supabase submit-score Edge Function supports `origin` hints plus both 120-second and legacy 180-second rounds. Edge Function updates are independent from the static GitHub Pages deployment.
