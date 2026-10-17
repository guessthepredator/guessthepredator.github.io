# Guess The Predator

A five-mode Apex Legends fan guessing game, built for GitHub Pages with global Supabase rankings. Independent fan project, **Made by Sebyby**. Not affiliated with EA or Respawn.

**Release:** V2.18 Neon Dual Daily (see `CHANGELOG_V218.md`).

**Play modes:** Classic, Pixel (Soft Blur), Quote, Ability and Emoji. **Daily:** two UTC challenges per day, Full Scan then One Signal; the underlying mode rotates between the five games. **Free Play:** unlimited attempts in all five modes.

**Forbidden Intel:** Completing Daily 1 opens a useful tip; completing Daily 2 opens a more advanced tip. Both are separately claimable, including if the round was lost.

**Rankings:** Daily and Overall via Supabase; backend recomputes score independently. V2.18 submissions contain 2 validated rounds and are normalized to the previous five-round score range for continuity. Existing database rows are not reset.

**Artwork:** the user-selected Mirage Halloween reference is included as a desktop background; real HTML buttons sit above it. Mobile has its own responsive layout. Some Legend portraits originate from external servers; see `assets/portraits/README.md` for the ten unverified transparent full-body files.

**Build:** static ESM modules. Open with an HTTP server for local testing; do not expect module imports to work directly from `file://` in every browser. Deployment and CI details in `START_HERE.md`.
