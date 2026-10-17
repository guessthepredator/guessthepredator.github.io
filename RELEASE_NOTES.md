# V2.5 Lightshift · Map Quality Gate

- Restored a readable **light pink / lilac / cyan game canvas** without replacing the dramatic homepage background.
- Fixed Free Play mistakenly displaying **Continue Daily**.
- Fixed **SOFT BLUR** button not responding and improved progressive blur levels, raster sampling, and full-character framing.
- Adjusted Browse Legends card sizes and consistent image containment (the externally sourced character poses are still non-uniform).
- Replaced 14 loud electronic WAV effects with shorter, quieter tactile sounds.
- Made Map strictly conditional on verified real external POI images; **removed all generated recon images** and prevented unsupported locations from entering the playable pool. Map disables itself when screenshots fail. Five daily core missions remain playable.
- Preserved text-only Quote and optional CC0 human-voice announcer integration. No robotic voice or official voice clips are distributed.
- Added deterministic/negative-path Map tests, Daily/Free Play checks, and offline Chromium QA (success path uses simulated QA media, not an actual Apex screenshot).

## Known limitations

- **0** real Apex map screenshots are bundled. External URLs are not guaranteed to load or be licensed for this project.
- **0** complete sets of local official 3D Legend renders. Existing externally sourced poses differ.
- Human announcer OGGs are **not** in the archive; optional network-dependent CC0 acquisition runs during deploy.
- EA currently restricts fan games; public GitHub release has legal risk. See `SOURCES_AND_RIGHTS.md`.
