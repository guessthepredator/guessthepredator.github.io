"""Create a temporary no-network inline browser preview, not a distribution build."""
from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
files=['src/data.mjs','src/art.mjs','src/ability_media_manifest.mjs','src/abilities.mjs','src/engine.mjs','src/spotlight.mjs','src/store.mjs','src/audio.mjs','src/map_media_manifest.mjs','src/maps.mjs','src/tips.mjs','src/voice_manifest.mjs','src/voice.mjs','src/announcer.mjs','src/app.mjs']
parts=[]
for fname in files:
    text=(root/fname).read_text()
    text=re.sub(r'^import\s+.*?\s+from\s+[\'\"][^\'\"]+[\'\"];?\s*','',text,flags=re.M|re.S)
    text=re.sub(r'\bexport\s+(?=(?:const|async|function|let|class)\b)','',text)
    parts.append('// '+fname+'\n'+text)
js='\n'.join(parts)
(root/'tests/bundled.js').write_text(js)
html=(root/'index.html').read_text()
import base64
from PIL import Image
html=__import__('re').sub(r'<link rel=\"stylesheet\"[^>]*>', '<style>'+(root/'styles.css').read_text()+(root/'pinkshift.css').read_text()+(root/'dark-pink-v23.css').read_text()+'</style>',html)
html=__import__('re').sub(r'<script type=\"module\" src=\"./src/app\.mjs[^\"]*\"></script>',lambda m:'<script>'+js+'</script>',html)
html=__import__('re').sub(r'<link rel="stylesheet" href="./pinkshift\.css[^"]*"/>','',html)
html=html.replace('./assets/decor/haunted-hero.webp','data:image/webp;base64,'+base64.b64encode((root/'assets/decor/haunted-hero.webp').read_bytes()).decode())
(root/'tests/browser_harness.html').write_text(html)
print(len(html),'bytes browser harness')
