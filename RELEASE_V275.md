# V2.75 — clearer play, Daily resets and Forbidden Intel

- Wider game and Trivia surfaces, moved toward the centre. The Trivia background host shifts left to keep his face visible.
- Written Trivia lifelines use authored options or answers from the same category and numeric/text type. Accepted alternate answers cannot become distractors. Choice lifelines still remove two options.
- Free Play completion offers Next Mode through Classic, Pixel, Quote, Ability, Emoji and Trivia, then back to Classic. Play Again remains available separately.
- Open tabs reset Daily Trivia at the UTC date boundary, including finished runs. Focus, page restoration and visibility changes also check the date. Old async responses cannot replace a new Daily view. Explicit Daily navigation clears archived date links; saved history remains intact.
- The Daily home promotes Forbidden Intel above the mode cards, explains both unlocks and shows the UTC reset date.
- Intel opens in a bounded dialog with a scrolling brief and persistent footer. The chest and brief have a short reveal animation with reduced-motion support.

Validation: 232 Node tests; release validator with CI’s legacy cleanup; browser checks at 1440, 900 and 390 pixels; exact UTC rollover for game and active/finished Trivia; complete Free Play cycle; Intel source and footer visibility. The live private lifeline function passed 1,740 question/seed checks and retains restricted execution permissions.

Backend migration: 20261020232833_trivia_plausible_lifelines_v275.sql, applied to the existing project. No scoring or historical result changes.
