# Live Leaderboards

Daily and Overall are powered by Supabase RPC functions and server-validated anonymous score submissions. The live Supabase project and publishable key are already configured; no database wipe or migration is required for V2.18.

A player must finish **both** Daily Challenges, Full Scan first and One Signal second, to submit. Wins earn points; loss still completes a checkpoint. The V2.18 score uses two rounds scaled by 2.5 to remain on the prior five-round point scale, and the Edge Function independently checks answers and results. Submission is allowed once per UTC day per player, including if the user played a legacy version earlier that same day.

Free Play scores never enter global rankings. Nicknames are public; do not use real names or contact information. The Supabase service-role secret is never distributed to the frontend.
