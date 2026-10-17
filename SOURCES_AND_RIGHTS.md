# Source / Rights Audit — V2.5 Test Build

**Not an authorized EA fan game.** EA's content policy allows some personal uses and fan sites, but **specifically disallows fan games, spin-offs and knock-offs**. Merely making small cosmetic modifications to copyrighted images, quoting the source, linking to a wiki, or adding a disclaimer does not guarantee that use is permissible. Public GitHub hosting could be subject to a copyright complaint.

EA policy: https://help.ea.com/en/articles/security-and-rules/ea-content-policy/

## Map images

The prototype references file redirect URLs published in `src/external_map_sources.mjs`. Wiki locations: https://apexlegends.wiki.gg/wiki/Category:Map_images and https://apexlegends.wiki.gg/wiki/Category:Kings_Canyon_images . The app **does not redistribute** those original screenshots inside the ZIP. They are external image URLs, not confirmed reproduction licenses. At runtime only successfully loaded external location references can enter the playable pool. The corresponding POI name comes from the catalog; unknown or mismatched images must be reviewed before release.

**Zero authentic Apex POI screenshots bundled.** **No fabricated Map image fallback.** If the external hosts block direct image embedding, Map cannot be played on that device. Our offline browser tests do not establish internet image availability.

## Other assets

28 Legend roster names are present, but official matching local 3D artwork is not. `src/art.mjs` uses external image URLs subject to third-party restrictions; it is not an image license. Eight old ability icon PNGs have unresolved permissions.

Original code, locally generated decorative background, CSS, and locally synthesized UI SFX are included. Quote text clues are written and are not voice impersonations. Human announcement playback is integrated with the optional Kenney Voiceover Pack released under CC0; the actual speech clips are **not included** in the ZIP and the deployment download can fail.

Kenney Voiceover Pack: https://kenney.nl/assets/voiceover-pack

This source list is informational, **not** certification of copyright or GitHub account safety.
