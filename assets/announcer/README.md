Human announcer clips (optional).

Source: Kenney Voiceover Pack — https://kenney.nl/assets/voiceover-pack
Author: Kenney; human voices as stated by author.
License: Creative Commons CC0 1.0 — https://creativecommons.org/publicdomain/zero/1.0/

GitHub Actions attempts to install the upstream pack during deployment.
If the download fails, the game still works, but the human announcer is unavailable.

For guaranteed distribution, download the original pack via the page above and run:
  python3 scripts/install_cc0_announcer.py "Voiceover Pack.zip"
Then commit assets/announcer/*.ogg and manifest.json.
These are human UI-announcer phrases, NOT licensed Apex-character voice acting.
