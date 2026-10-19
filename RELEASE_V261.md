# The Apex Challenge V2.61

Daily completion now opens a summary with separate Challenges and Trivia scores. Submit the Challenges score before or after Trivia; Trivia receipts are saved locally and remain automatically submitted by the server. Existing progress and scores are preserved.

Trivia view epochs isolate late responses after mode changes, expiration failures retry with a three-second backoff, and the saved server run date determines rewards across UTC reset. The authenticated Trivia RPC now returns its saved run day without changing grants, scoring, or timing.

Nickname drafts survive background renders and cross-tab updates. Escape closes the nickname dialog, and modal focus loops include inputs, links and the wheel repeat checkbox. Nicknames are required in both submission forms. View Rankings navigates to Rankings. Daily games initialize the new round at UTC reset.

On mobile, the clue and answer controls precede the Identity Board. The summary uses the real submission receipt when available; older completed Trivia runs without a local receipt show Submitted instead of inventing a score.

Ranked timing rejects future, previous-day, inverted and missing timestamps against server time. This is validation hardening, not fully authoritative anti-cheat: deduction history and plausible timestamps still originate in the browser. Stronger protection requires server-owned round state.

Validation: 205 tests passed, browser checks for summary navigation and 390px layout, preserved nickname drafts under cross-tab updates, Escape/reopen, wheel checkbox tab access. Deployed score endpoint preserves CORS 204 and unauthenticated POST 401. No production test scores were submitted.
