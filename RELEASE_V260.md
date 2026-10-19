# The Apex Challenge V2.60

Daily Next uses an explicit ranked context: Full Scan, One Signal, then Daily Trivia, followed by rankings once Trivia is complete. A Daily route that does not belong to today's schedule no longer silently falls back to Free Play. The separate quick links say Switch to Free Play during Daily sessions.

Emoji begins with two visible symbols and reveals the next symbols after guesses 1, 3 and 5. Finished rounds reveal all symbols. Full Scan retains five attempts and One Signal retains six, verified with real engine rounds.

The Bangalore/Newcastle homeworld question now names the Legends directly; the answer and concept are unchanged. Wording update applied and verified separately in Supabase.

Validation: 198 tests passed, including seven new behavior checks. Browser checks confirmed ranked Trivia after Next Daily and Emoji increasing from two to three symbols after one wrong guess. User progress and production scores were preserved.
