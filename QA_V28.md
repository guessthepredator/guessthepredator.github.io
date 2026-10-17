# QA V2.8 TWILIGHT

- 22 Node automated checks + release Python validator + node --check for each ESM module.
- Offline Chromium browser tests at desktop 1600×900 and mobile 390×844: homepage has exactly 5 mode cards; stable Daily/Free Play switch and single primary CTA; dark Classic contrast from computed CSS; Pixel, dedicated Rankings and navigation show no browser JS errors. Browser used an offline harness with mocked rankings and unavailable external portraits. Screenshots under tests were not included in archive.
- Completed all 5 Daily modes with deterministic correct answers in a simulated offline browser; reached nickname entry with local total 7,665. This is not a real server submit or proof of live rankings.
- Supabase live project checked from connected account: `gtl` ACTIVE_HEALTHY; `submit-score` ACTIVE; daily and overall reader RPCs return zero current entries.
- Real internet-backed GitHub Pages → anonymous Auth → Edge Function → Postgres full test remains for owner after deploy; network isolation blocked direct website testing in this environment.
- No new Map, announcer voices, generated fake characters or fake leaderboard records added.
