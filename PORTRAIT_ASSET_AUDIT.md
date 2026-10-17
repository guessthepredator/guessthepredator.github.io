# Browse Legends — Asset Accuracy Audit

**Highest-priority asset gap:** verified full-body, transparent renders for Vantage, Sparrow, Rampart, Revenant, Loba, Gibraltar, Conduit, Catalyst, Ballistic, Alter.

This release makes all 28 character cards consistently sized, aligned and dark-backed with no colored portrait backplates. It does NOT claim the ten portrait source files are full-body when they are not.

Current `assets/portraits/` is empty. The local-first loader currently tries the curated remote genuine-character sources from `src/art.mjs`. Sources may be unavailable or differ in crop/framing.

## Completing the final body-render set (once licensed source art is available)

1. Obtain an accurate original full-body transparent render for each named Legend, with redistribution permitted. Verify character identity and pose visually; do not use unrelated AI approximations.
2. Save as a portrait-oriented transparent `PNG` or `WebP` to `assets/portraits/<slug>.png`. Prefer at least ~450 px height and alpha transparency. Trim excess margins while preserving all visible head-to-boots character parts.
3. Run `python3 scripts/import_portraits.py` to audit alpha/transparency, dimensions and portrait ratio. **Visually confirm each identity and complete body**. Then run `python3 scripts/import_portraits.py --apply` to update `src/portrait_media_manifest.mjs` automatically. Add only files that genuinely exist.
4. Re-run `node --test tests/*.test.mjs` and preview Browse Legends on mobile and desktop.

No changes to gameplay, matchmaking, backend or scoreboard are required to install a verified image replacement.
