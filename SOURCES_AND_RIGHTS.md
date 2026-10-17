# Sources, rights, and map image provenance (V2.4)

## Critical publication caution

This is an **independent Apex-related fan trivia project**. **EA's current content policy explicitly says it does not allow fan games, remakes, or spin-offs.** Merely presenting disclaimers or linking to a page instead of copying screenshots does **not** guarantee immunity from a copyright/DMCA complaint. We cannot certify that public GitHub Pages hosting is authorized. For a clearly compliant public product, obtain permission from the rightsholders or replace EA-specific names, designs, and gameplay identifiers with original IP.

Policy: https://help.ea.com/en/articles/security-and-rules/ea-content-policy/

## What was researched

- [Apex Legends Wiki — Kings Canyon screenshots](https://apexlegends.wiki.gg/wiki/Category:Kings_Canyon_images) includes Caustic Treatment, Crypto's Map Room, Bunker, and Octane's Gauntlet.
- [Apex Legends Wiki — official screenshots](https://apexlegends.wiki.gg/wiki/Category:Official_screenshot_images) contains Storm Point and other location captures.
- [EA official Maps — Kings Canyon](https://www.ea.com/games/apex-legends/apex-legends/game-objects/maps-hub/game-object/kings-canyon) provides a map page, not a redistribution license.
- [EA official content policy](https://help.ea.com/en/articles/security-and-rules/ea-content-policy/) is controlling for authorized uses.

`src/external_map_sources.mjs` holds documented filename references. The app tries a remote Wiki file redirect for a matched POI, then a local hand-built schematic. **A screenshot publicly accessible on a wiki or news article is NOT confirmed to be licensed for display inside this game.** No official Apex screenshots are physically bundled in this ZIP. The linked wiki may reject hotlinks or change file URLs. Do not claim these URLs are 'approved' or guaranteed.

Portrait art is also externally linked in `src/art.mjs`; that does not grant distribution or display permission. Eight legacy Ability icons have unverified rights. Local backgrounds, schematic clues, new CSS and UI SFX are project-created assets. Quote only displays text clues, and the optional Kenney announcer uses CC0 voice clips only if installation succeeds and source attribution/license are confirmed by source.

## What was removed

The previous Media Studio user upload workflow, fake/generated replacements for Apex Legends in the roster, arbitrary POI imagery, the extra mode-entry sound files, duplicated announcement installs, and artificial Mirage eye canvases.

## Shipping status

| Resource | In ZIP | Reliability |
| --- | --- | --- |
| 36 POI-specific fallback sketches | Yes | Local, all available |
| Apex POI in-game screenshots | No | Remote Wiki reference, permission unverified, availability unverified |
| 28 real Legend render files | No | Externally linked, no guaranteed availability |
| 14 original sound cues | Yes | Local WAV |
| Actual recorded human announcer voice clips | No | Optional Kenney CC0 deploy integration, network-dependent |
| Original project interface artwork | Yes | Local |

No guarantee of GitHub / EA compliance can be made. Test in a private preview before publication.
