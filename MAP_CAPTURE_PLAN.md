# 36-location map capture plan (rights-dependent)

This is a preparation checklist, **not an asset license**. The project cannot publish or redistribute screenshots without appropriate rights and compliance with EA’s content policy. The EA policy currently does not allow fan games/spin-offs.

Media Studio supports up to **8 independent screenshots** per sector (up to 288 slots total). Keep images free of captured personal information or player chat. The app will rotate only local files declared in its manifest.

## Locations

| Map | Sector | Type | Local asset prefix | Installed |
|---|---|---|---|---|
| Kings Canyon | Caustic Treatment · Exterior | Exterior | `kc-caustic-exterior` | No |
| Kings Canyon | Caustic Treatment · Interior | Interior | `kc-caustic-interior` | No |
| Kings Canyon | Crypto’s Map Room · Interior | Interior | `kc-crypto-interior` | No |
| Kings Canyon | Bunker · Corridor | Interior | `kc-bunker` | No |
| Kings Canyon | Octane’s Gauntlet | Exterior | `kc-gauntlet` | No |
| Kings Canyon | The Cage | Exterior | `kc-cage` | No |
| World’s Edge | Big Maude | Exterior | `we-big-maude` | No |
| World’s Edge | Big Maude · Workshop | Interior | `we-big-maude-interior` | No |
| World’s Edge | Lava Siphon | Exterior | `we-lava` | No |
| World’s Edge | Climatizer | Exterior | `we-climatizer` | No |
| World’s Edge | Countdown | Exterior | `we-countdown` | No |
| World’s Edge | Bloodhound’s Trials · Arena | Interior | `we-trials` | No |
| Olympus | Bonsai Plaza | Exterior | `ol-bonsai` | No |
| Olympus | Autumn Estates | Exterior | `ol-estates` | No |
| Olympus | Autumn Estates · Villa | Interior | `ol-estates-interior` | No |
| Olympus | Hammond Labs · Interior | Interior | `ol-hammond` | No |
| Olympus | Rift | Exterior | `ol-rift` | No |
| Olympus | Oasis | Exterior | `ol-oasis` | No |
| Storm Point | Barometer | Exterior | `sp-barometer` | No |
| Storm Point | Command Center | Exterior | `sp-command` | No |
| Storm Point | Command Center · Interior | Interior | `sp-command-interior` | No |
| Storm Point | Storm Catcher | Exterior | `sp-catcher` | No |
| Storm Point | The Mill | Exterior | `sp-mill` | No |
| Storm Point | Lightning Rod | Exterior | `sp-lightning` | No |
| Broken Moon | Terraformer | Exterior | `bm-terraformer` | No |
| Broken Moon | Production Yard | Exterior | `bm-production` | No |
| Broken Moon | Production Yard · Interior | Interior | `bm-production-interior` | No |
| Broken Moon | Perpetual Core · Turbine | Interior | `bm-core` | No |
| Broken Moon | Stasis Array | Exterior | `bm-stasis` | No |
| Broken Moon | Alpha Base | Exterior | `bm-alpha` | No |
| E-District | City Hall | Exterior | `ed-city-hall` | No |
| E-District | City Hall · Lobby | Interior | `ed-city-hall-interior` | No |
| E-District | Boardwalk | Exterior | `ed-boardwalk` | No |
| E-District | Boardwalk · Nightclub | Interior | `ed-boardwalk-interior` | No |
| E-District | Galleria · Shopping Arcade | Interior | `ed-galleria` | No |
| E-District | Neon Square | Exterior | `ed-neon` | No |

## Reference-only resources (not grants of reproduction rights)

- EA official Apex Legends maps information: https://www.ea.com/games/apex-legends
- EA content policy: https://help.ea.com/en/articles/security-and-rules/ea-content-policy/

The external screenshot catalogs referenced in earlier versions were not verifiably cleared for redistribution in this interactive fan project; nothing from them has been included automatically.

## Installation

Use `MEDIA_STUDIO.html` to import images and export a pack. The generated files use names such as `assets/maps/ol-bonsai.webp`, `assets/maps/ol-bonsai-2.jpg`, and `assets/maps/ol-bonsai-3.webp`, with `src/map_media_manifest.mjs` storing the authorized rotation list. Extract over the repo root; commit and deploy; verify with `MEDIA_DIAGNOSTIC.html`.
