"""Convert approved screenshot files named by GTP2 catalog ID to WebP.
Usage: python scripts/import_maps.py /folder/with/your/screenshots
Example: kc-caustic-exterior.png -> assets/maps/kc-caustic-exterior.webp
"""
from pathlib import Path
from PIL import Image
import sys,json
root=Path(__file__).resolve().parents[1]
if len(sys.argv)!=2:
    raise SystemExit('Usage: python scripts/import_maps.py /path/to/folder')
folder=Path(sys.argv[1])
if not folder.is_dir(): raise SystemExit('Source folder not found')
items=json.loads((root/'assets/map-catalog.json').read_text())
ok=[];missing=[]
for entry in items:
    candidates=[folder/f"{entry['id']}{ext}" for ext in ('.png','.jpg','.jpeg','.webp')]
    f=next((v for v in candidates if v.exists()),None)
    if not f: missing.append(entry['id']); continue
    with Image.open(f) as img:
        img.load()
        if img.width<320 or img.height<180 or img.width/img.height<1.2:
            print('SKIPPED unsuitable image:',f);continue
        img.convert('RGB').save(root/'assets/maps'/f"{entry['id']}.webp",'WEBP',quality=84,method=6)
    ok.append(entry['id'])
print(f'Imported {len(ok)} real user-selected images, {len(missing)} still missing')
