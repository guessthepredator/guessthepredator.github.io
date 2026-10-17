# Sources and distribution notes — NOVA V2.6

This is a fan-made Apex-themed trivia prototype, not endorsed by EA/Respawn. It is NOT certified as legally safe to publish on GitHub Pages. EA content policy: https://help.ea.com/en/articles/security-and-rules/ea-content-policy/

**Map:** 36 catalogued POIs; zero verified Apex screenshot files bundled. `src/external_map_sources.mjs` lists wiki filenames. The browser checks their availability; successful network loading is not a reproduction license. If none loads, Map stays disabled rather than displaying unrelated art.

**Legends:** 28 names but zero verified locally licensed identical-pose 3D renders. `src/art.mjs` tries third-party portrait sources, which can be unavailable or restricted. The UI treats missing portraits as unavailable; it never substitutes misleading generic characters.

**Audio:** 14 local original non-verbal synthesised SFX, no EA sound recordings, no announcer, no synthetic speech.

**Other:** 8 legacy Ability PNGs, permissions unverified. Six local decorative vector backgrounds, original project art. The homepage background is fan artwork, not guaranteed cleared for third-party distribution.

EA's fan-content restrictions, including fan games, still apply regardless of recoloring, disclaimers or naming.
