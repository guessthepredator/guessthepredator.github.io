# V2.7 Mirage Edition — release notes

- Main menu: five modes, new split 2+3 card arrangement, highlighted Daily / Free Play, animated scroll-down control, more visible daily extras.
- Map fully removed from gameplay, navigation and future daily progress count (five).
- Classic unknown ID redesigned with a question mark and central full-width banner; compact play controls, game history and scanner; missing Age shows `UNDISCLOSED` not `N/A`.
- Pixel has fixed neutral environmental palette independent of Legend, smaller initial reveal resolution, and revised three style presets; fallback identity details also reveal later.
- Emoji audit: 28 distinct three-symbol clue sets with signature-anchored corrections.
- UI/UX: dusk-pink / lavender with dark magenta and cyan highlights, reduced clutter; navigation to standalone How To Play, FAQ, Daily/Overall rankings.
- Audio: replaced the deck with 13 synthesized **nonverbal** clicks, sweeps and reward cues; no human or robotic announcer.
- Scoring: per-mode Daily base score, local preview, +5% streak bonus per consecutive five-win day (up to +50%), separately listed Daily & Overall totals in Supabase schema.
- Online publishing requires separately provisioning Supabase, Edge Function and anonymous auth. A simple client-only game is never protected against all cheating; this patch performs server-side target/result checks and one entry/day per anonymous user.
- CI: run only core + V2.7 tests; deterministic single CSS/JS tag. Clean installer removes earlier version files.
- Browser QA: 1600×900 / 390×844 menu, Classic, Pixel, guide, FAQ and offline ranking panels tested in Chromium. Five Daily win-to-ranking flow tested offline. No live Supabase/Pages access asserted.

Limitations: Apex portrait hotlinks remain unreliable where providers block them; media permissions are not certified. Global backend has not been deployed in the owner's account.
