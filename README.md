# Guess The Predator 2 — V2.7 Mirage Edition

Five-mode independent fan-trivia website for GitHub Pages. Full repository root in this ZIP.

## Included
- 5 Daily / Free Play modes: Classic, Pixel, Quote, Ability, Emoji. **Map is removed from the UI and logic.**
- Mirage landing page with reorganized animated cards, prominent Daily / Free Play control, and Scroll for Extras.
- Classic: new question panel, more visible settings, shorter content layout, `UNDISCLOSED` for unknown ages.
- Pixel: progressive mosaic / soft blur / signal with the same backdrop for every Legend (less background leakage).
- Emoji: individual audit of the 28 three-symbol clue groups.
- Pure instrumental UI sound palette: 13 small WAV effects, no spoken announcer and no extracted Apex recordings.
- Wheel, Legend of the Day, 5-mission Forbidden Intel, local streaks and personal stats.
- **Two public leaderboard UIs**: Daily and Overall, with nickname entry after all 5 Daily rounds. Supabase schema + Edge submission function included in `supabase/`.
- Standalone How To Play and FAQ in the top navigation.

## Deploy
Start with [START_HERE.md](START_HERE.md). For global leaderboard deployment, [LEADERBOARD_SETUP.md](LEADERBOARD_SETUP.md) is required. GitHub Pages alone does not include a database.

## Accuracy & limitations
- Website works as a local/static app without Supabase; scoreboards honestly report `RANKINGS NOT CONNECTED YET` until configured. No fabricated entries.
- The 28 playable Legend identities are preserved; artwork is linked to external reference sources and may fail or be protected. We deliberately do not replace them with fake stand-in characters.
- 8 locally included Ability icons. Other Legends will not appear in Ability target rotation until verified local icon assets are installed.
- Overall score is tracked by the same anonymous login on that browser. New browser / cleared storage does not recover the identity.
- Global submission checks authenticated users, the 5 Daily target answers and plausible results server-side, with one entry/day per user. This is **not fraud-proof**; client-readable trivia can still be manipulated.
- Not affiliated with EA or Respawn. Review `RIGHTS_AND_GITHUB_AUDIT.md` before public release.
