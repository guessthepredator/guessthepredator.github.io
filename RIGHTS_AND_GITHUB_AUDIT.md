# Asset rights and GitHub publication audit — V2.7

The game references Apex/Respawn characters and an artistic Mirage-themed homepage. It is an **unofficial fan game**, not EA/Respawn-approved. A disclaimer or small edits to copyrighted images do not automatically grant rights; EA content restrictions still apply: https://help.ea.com/en/articles/security-and-rules/ea-content-policy/

- **Map**: removed entirely. No screenshot pack or unlabeled replacement artwork.
- **Portraits**: 28 character entries, images selected from third-party external sources (`src/art.mjs`); availability and rights are **unverified**. An unavailable portrait is reported as unavailable, not replaced with a generic character.
- **Ability**: eight legacy game-icon PNGs remain; rights must still be checked before public redistribution.
- **UI SFX**: 13 original locally generated nonverbal sounds. No voice lines or imported game recordings.
- **Backdrop and art**: Mirage-inspired fan artwork; not represented as rights-cleared or as official EA promotional content.
- **Leaderboard**: player-selected public nickname and scores are visible in ranking results when connected. Do not collect emails, contact details or real names in the site. Anonymous sessions are stored in the browser. The database is in an external Supabase project that you control; secure its access and comply with relevant privacy requirements.

**Publishing risks remain.** This release fixes app behavior, not IP clearance. See `LEADERBOARD_SETUP.md` for DB/auth abuse controls.
