# V2.18 — Neon Dual Daily

## Homepage and navigation
- Full-viewport desktop scene; the user-approved 1536 × 1024 Mirage art stays the image source, with no old pillarboxing.
- Real focusable buttons and readable text replace invisible overlay hit boxes. On desktop the top header, challenge selectors, mode cards, and footer are genuine DOM elements, not bitmap-only UI.
- Masked obsolete bitmap controls underneath actual buttons. Actual five-mode cards reuse artwork crops, avoiding duplicate captions and clipping borders on hover.
- Daily Challenge and Free Play route into working gameplay. Mobile uses the same real controls in a scrollable layout.
- Legend of the Day has a visible single-letter emblem if its original remote portrait fails; it still attempts the original character's artwork. This is **not** a verified full-body portrait.

## Two Daily Challenges
- One shared Full Scan challenge **first**; One Signal challenge unlocks only after Full Scan finishes (win OR loss).
- Daily challenge modes rotate deterministically across Classic, Pixel, Quote, Ability, Emoji by UTC day. Each track picks a different mode and answer. All five modes always remain available in Free Play.
- Rewards: checkpoint 1 gives useful Daily Intel; checkpoint 2 gives Advanced/Rare Intel. They are separately claimable after completing the corresponding round.
- Saved legacy day data and Free Play are retained, with new rounds stored separately in `days[day].daily218`.

## Game screens
- Shared futuristic dark interface and accents per mode: coral, electric cyan, amber, ultraviolet, and teal.
- More legible style strip and dark scanner cards. Existing hint semantics, animations, sounds, and six-trait scanner remain.

## Leaderboard
- `submit-score` Supabase Edge Function **v5** deployed and confirmed ACTIVE; supports new `protocol:'v218'` with 2 tracks, and legacy 5-mode submissions. No database reset.
- Two new Daily rounds are normalized by 2.5 to the old five-mode point range; the final value is independently recalculated by the server. One submission per UTC day remains enforced.
- Some users who already submitted a legacy score today cannot submit a second score today; this is intentional anti-duplicate protection.

## Asset caveat
- The requested full-body transparent images for Vantage, Sparrow, Rampart, Revenant, Loba, Gibraltar, Conduit, Catalyst, Ballistic and Alter **are not bundled**, because reliable, permitted source files are not present. Image sizing and the local-manifest pipeline are ready; see `assets/portraits/README.md`. The existing original images still act as fallback.

## QA
- 65/65 Node tests passing, including seven V2.18 scenarios. `scripts/validate_release.py` passes.
- Chromium checked homepage at 1440×900, 1640×820, 390×844, Free Play launch, both Daily launches, full win-to-next transition, both rewards unlocked and checkpoint 1 opened. No page errors in that run. Remote image and Supabase submission were not emulated in this offline browser test.
