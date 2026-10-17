# V2.22 – Orbit & Stability Fix

- Real six-card orbit (five game modes + Trivia) around centrally featured Forbidden Intel. Two dock panels beneath, with fully clickable full-width wheel.
- Unified global navigation: HOME is always present, same logo everywhere, regardless of which screen is open.
- Full Scan: confirmed trait memory strip and each previous scan preserved in visible history; original engine logic remains unchanged.
- Local stats and submitted score receipts continue across reloads (same browser); daily scores still validate on server and global leaderboards still refresh from Supabase.
- Leaderboard now caches the last good daily/overall rows and does not blank the board while refreshing.
- Browse Legends uses a consistent transparent model stage; ten previously inconsistent portraits first attempt authentic Original skin renders, with fallback sources. NOT 10 verified local asset files.
- No database migration or Supabase modification required. V2.21 Trivia and V2.18 Daily backend protocols unchanged.
