# The Apex Challenge — V2.54

- Five approved cinematic backgrounds for Ability/Octane, Pixel/Sparrow, Emoji/Wattson, Quote/Loba and Trivia/Crypto. Classic keeps its existing theme. Backgrounds are fixed decorative layers and cannot change grid sizing or catch clicks.
- Genuine in-game Mythic bin replaces the generated version on Home and the reward dialog.
- Explicit Daily / Free Play selection, saved between visits, with per-stage daily status and permanent ranked/unranked context during games. Daily cards follow today's actual schedule and lock One Signal until Full Scan is finished.
- 24 practical tactical notes and puzzle tips replace generic guide summaries, without falsely attributing original advice to EA.
- Shared anonymous sign-in for concurrent score/trivia requests, recoverable SDK import failure, cache-write failure isolation, saved Trivia rankings and duplicate score submission guard. Existing player identity and local progress keys remain intact.
- Mobile clue, input and scanner sections stack without overlap.
- Brand metadata, FAQ, current setup documents and deployment label use The Apex Challenge.

## Verification
184 publication-suite tests passed before final visual polish; final rerun recorded separately. Read-only production queries confirmed all four ranking RPCs respond. No fabricated production score was submitted. Browser review covers desktop and 390px mobile, all six modes, overflow, background bounds and clue/control separation.

## Domain
The current URL remains https://guessthepredator.github.io/. A branded custom domain requires the exact domain name, ownership and DNS configuration. Existing local progress is tied to the current browser origin; changing origins requires a migration plan. No domain was purchased or guessed.
