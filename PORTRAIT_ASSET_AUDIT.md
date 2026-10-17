# V2.22 portrait asset audit

**Highest priority fix:** all 28 Browse Legends cards now share the exact same clean model stage, scale, bottom alignment, transparent frame and text hierarchy.

Ten problematic Legends (Vantage, Sparrow, Rampart, Revenant, Loba, Gibraltar, Conduit, Catalyst, Ballistic, Alter) now attempt `Original [Legend].png` model/skin-renders from the Apex Legends Wiki first, then keep the old sources as fallback. The wiki lists model-sized Original skin images, typically 546×858 or 728×1144. Hotlink permissions, transparency and visual completeness remain dependent on the external hosts and **cannot be guaranteed until verified on the deployed website**.

Verified archive category references:
- https://apexlegends.wiki.gg/wiki/Category:Loba_skin_images
- https://apexlegends.wiki.gg/wiki/Category:Ballistic_skin_images
- https://apexlegends.wiki.gg/wiki/Category:Datamined_skins (Vantage)
- https://apexlegends.wiki.gg/wiki/Sparrow

For fully offline and stable 28/28 renders, provide appropriately licensed transparent PNGs named `assets/portraits/<slug>.png` and update `src/portrait_media_manifest.mjs`. We do not claim ten local verified cutouts are bundled. This is not an AI recreation of the characters.
