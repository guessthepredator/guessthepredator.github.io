# V2.65 — One Daily puzzle, two difficulties

Daily now starts with a full-screen split selection: green Full Scan (Easy, five guesses) or red One Signal (Hard, six guesses). Both choices use the same mystery Legend and mode. Selection locks when started. Rush begins at the first guess. The single result leads directly to the score summary; Trivia stays independent. Started legacy rounds and scores are preserved.

Nicknames are now reserved across Challenge and Daily Trivia submissions after case and whitespace normalization. Existing colliding player names are disambiguated in rankings without deleting or merging their scores.

Forbidden Intel contains 12 original summaries of player-authored guides from r/ApexUniversity and the Apex Movement Wiki. Each includes the input scope, technique, reasoning, common mistake, practice drill and source link. Two reward checkpoints remain: Daily puzzle and Daily Trivia.

Validation: 222 game/catalog/asset/server tests, live database reservation checks with rollback, authenticated score endpoint CORS and missing-auth checks, desktop split-screen and 390px mobile UI checks. No production test scores.
