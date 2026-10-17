"""Offline Chromium smoke test only; never put simulated media into the release."""
from pathlib import Path
import re,base64,io
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parents[1]
files=['src/data.mjs','src/art.mjs','src/ability_media_manifest.mjs','src/abilities.mjs','src/engine.mjs','src/spotlight.mjs','src/store.mjs','src/audio.mjs','src/map_media_manifest.mjs','src/external_map_sources.mjs','src/maps.mjs','src/map_runtime.mjs','src/tips.mjs','src/voice_manifest.mjs','src/voice.mjs','src/announcer.mjs']
parts=[]
for fname in files:
    text=(root/fname).read_text()
    text=re.sub(r'^import\s+.*?\s+from\s+[\'\"][^\'\"]+[\'\"];?\s*','',text,flags=re.M|re.S)
    text=re.sub(r'\bexport\s+(?=(?:const|async|function|let|class)\b)','',text)
    parts.append('// '+fname+'\n'+text)
app=(root/'src/app.mjs').read_text()
app=re.sub(r'^import\s+.*?\s+from\s+[\'\"][^\'\"]+[\'\"];?\s*','',app,flags=re.M|re.S)
app=re.sub(r'\bexport\s+(?=(?:const|async|function|let|class)\b)','',app)
html=(root/'index.html').read_text()
style=''.join((root/p).read_text() for p in ['styles.css','pinkshift.css','dark-pink-v23.css','eclipse-v24.css','lightshift-v25.css'])
html=re.sub(r'<link rel="stylesheet"[^>]*>','',html)
html=html.replace('</head>','<style>'+style+'</style></head>')
html=html.replace('./assets/decor/haunted-hero.webp','data:image/webp;base64,'+base64.b64encode((root/'assets/decor/haunted-hero.webp').read_bytes()).decode())

im=Image.new('RGB',(800,450),'#d9bad6');dr=ImageDraw.Draw(im)
dr.rectangle((45,60,755,390),outline='#73477d',width=5)
dr.text((250,200),'QA ONLY - VERIFIED IMAGE SIMULATION',fill='#342048')
buf=io.BytesIO();im.save(buf,format='PNG')
simulation='data:image/png;base64,'+base64.b64encode(buf.getvalue()).decode()

for name,preflight in [('offline',"findVerifiedMapImages=async()=>[];"),('verified',"findVerifiedMapImages=async()=>[{entry:LOCATIONS.find(e=>e.id==='kc-caustic-exterior'),url:"+repr(simulation)+"}];")]:
    js='\n'.join(parts)+'\n'+preflight+'\n'+app
    output=re.sub(r'<script type="module" src="./src/app\.mjs[^"]*"></script>',lambda m:'<script>'+js+'</script>',html)
    (root/'tests'/f'v25_{name}_harness.html').write_text(output)
print('Created two separate offline test harnesses (offline + simulated image). Not release artifacts.')
