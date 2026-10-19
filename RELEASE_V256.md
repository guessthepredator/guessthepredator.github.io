# The Apex Challenge V2.56

Removed duplicate Home and game session panels. Restored the scanner to a dedicated responsive grid area, with all six traits rendered in all guessing modes. Completed Daily cards are disabled and grey. Classic now uses a deduction prompt. Mythic Bin has subtle light and a feathered edge. Loba artwork has a revised outfit and open back. Secondary pages use local character art.

Trivia has a server-owned lifeline per question: 50/50 for choice questions or four options for written questions. Help keeps the deadline and lowers a correct answer to 10 points. Correct-answer totals are tracked independently from score. Practice requires no chosen nickname.

Validation: 187 repository tests pass, including actual HTML-rendering regressions. All modules pass syntax checks. Database transaction tests verify guest Practice, hint behavior, unchanged deadline, 10-point scoring, repeat-answer idempotence and ownership checks, then roll back. All 166 active questions produce valid helper choices with exactly one accepted answer. Public asset references are present. Browser visual QA was unavailable in this session.

Hosting: existing public Site retained. A separate free Vercel address requires the user's connected Vercel account; no domain purchase or hosting charge was made.
