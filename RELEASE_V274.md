# V2.74 — Daily difficulty scoring

- Easy (Full Scan): 70% of the normal Daily base score. Hard (One Signal): 100%, unchanged.
- Calculate the existing streak bonus after applying the difficulty weight and rounding the base score.
- Keep the authoritative submit-score function and the browser preview in sync. Server computes the weight from the validated difficulty, ignoring browser-supplied score/multiplier fields.
- Update the difficulty selector, game result, Rankings, How to Play and FAQ. Preserve recorded submission receipts and existing public scores; Free Play, Trivia and legacy multi-puzzle scoring remain unchanged.
- Validation: 226 regression tests, including 18 client/server parity cases across guesses and hints plus losses; difficulty selector and both Daily score views checked at desktop/mobile widths.
