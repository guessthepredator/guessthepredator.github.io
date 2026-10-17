# GTP2 V2.8 · TWILIGHT PATCH

- Fixes broken homepage Daily/Free Play / CTA layout: single full-width action and separated Global Rankings button.
- Session switch updates only interactive controls instead of rerendering whole hero (no backdrop flash).
- Gameplay shifts from pastel white to dark plum panels with cyan/magenta accents, subtle textured backdrop, and filled buttons.
- Classic and game controls remain above the fold more consistently on desktop, with clear mystery banner and visible history.
- Pixel reveal is slower/harder with neutral constant background; no location clues.
- Emoji extras sweep removes repeated symbols on 13 entries.
- Replaces all 13 UI WAV cues with distinct original, nonverbal soft plucks/chimes; no speech or voice samples.
- Retains Supabase URL + publishable key from V2.7.1, same save key and streak logic. Does not reset player progress.
- Does not create fake rankings or promise end-to-end connectivity without testing anonymous login on the user's site.

QA: 22 tests, two viewport browser checks, offline five-Daily flow. Auth-enabled public submit to be verified after deploy.
