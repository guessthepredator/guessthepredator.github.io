"""Original abstract mode-specific vector wallpapers; no game screenshots or characters."""
from pathlib import Path
import random,math
R=Path(__file__).resolve().parents[1];out=R/'assets/game-bg';out.mkdir(exist_ok=True)
styles={
'classic':('#291039','#6b2996','#fa7bca','TRAIT MATRIX'),
'pixel':('#0f2246','#177fa8','#97c8fa','IMAGE DECODER'),
'quote':('#2c0c2d','#a33b83','#fcadcb','INTERCEPTED SIGNAL'),
'ability':('#102a3c','#2d7a81','#abf8dc','TACTICAL BLUEPRINT'),
'emoji':('#240f43','#7b39b2','#ffa2dd','SYMBOL TRANSLATOR'),
'map':('#0a253b','#46629f','#bdb6f8','REGIONAL NAVIGATION')}
for mode,(dark,mid,hot,title) in styles.items():
 rng=random.Random(sum(map(ord,mode)))
 bits=[]
 bits.append(f'<rect width="1600" height="900" fill="url(#bg)"/>')
 bits.append('<path d="M0 780 Q490 650 850 750 T1600 670 L1600 900 L0 900Z" fill="#130e27" opacity=".52"/>')
 for j in range(23):
  x=rng.randrange(0,1600);y=rng.randrange(120,800)
  bits.append(f'<circle cx="{x}" cy="{y}" r="{rng.randrange(2,7)}" fill="{hot}" opacity=".20"/>')
 if mode=='classic':
  for x in [210,390,570,1030,1210,1390]:
   bits.append(f'<rect x="{x}" y="180" width="150" height="470" rx="16" fill="#040817" fill-opacity=".25" stroke="{hot}" stroke-opacity=".19" stroke-width="3"/>')
   for y in range(222,650,80):bits.append(f'<rect x="{x+22}" y="{y}" width="108" height="22" rx="6" fill="{hot}" fill-opacity=".13"/>')
 if mode=='pixel':
  for y in range(80,820,60):
   bits.append(f'<path d="M80 {y}L1520 {y}" stroke="{hot}" stroke-opacity=".14" stroke-width="2" stroke-dasharray="19 15"/>')
  for x in range(120,1510,92):
   bits.append(f'<rect x="{x}" y="{rng.randrange(140,650)}" width="58" height="58" fill="none" stroke="{hot}" stroke-opacity=".21" stroke-width="3"/>')
 if mode=='quote':
  for k in range(3):
   x=250+k*510
   bits.append(f'<rect x="{x}" y="200" width="300" height="350" rx="22" stroke="{hot}" stroke-opacity=".24" stroke-width="3" fill="#040619" fill-opacity=".16"/>')
   for j in range(10):bits.append(f'<path d="M{x+30} {250+j*23} L{x+240} {250+j*23}" stroke="{hot}" stroke-opacity=".12" stroke-width="6"/>')
  bits.append(f'<path d="M0 550 '+ ' '.join(f'L{i*30} {550+int(54*math.sin(i*.78)+23*math.cos(i*.3))}' for i in range(54)) + f'" stroke="{hot}" stroke-width="6" fill="none" opacity=".24"/>')
 if mode=='ability':
  for y in range(160,780,120):
   for x in range(100,1480,180):
    bits.append(f'<path d="M{x} {y} h120 l60 60" fill="none" stroke="{hot}" stroke-opacity=".14" stroke-width="4"/>')
    bits.append(f'<circle cx="{x+120}" cy="{y}" r="9" fill="{hot}" opacity=".18"/>')
 if mode=='emoji':
  symbols=['✦','◈','⌁','✶','◇','☆']
  for j in range(26):
   x=rng.randrange(60,1510);y=rng.randrange(90,800)
   bits.append(f'<text x="{x}" y="{y}" fill="{hot}" opacity=".12" font-size="{rng.randrange(44,122)}" font-family="system-ui">{symbols[j%6]}</text>')
 if mode=='map':
  for r in [180,300,420,570]:bits.append(f'<circle cx="900" cy="420" r="{r}" fill="none" stroke="{hot}" stroke-opacity=".12" stroke-width="3"/>')
  for k in range(12):
   angle=2*math.pi*k/12
   bits.append(f'<path d="M900 420 L{900+590*math.cos(angle):.1f} {420+590*math.sin(angle):.1f}" stroke="{hot}" opacity=".08" stroke-width="3"/>')
  for j in range(5):
   pts=' '.join(f'{x},{int(440+65*math.sin(x/80+j))}' for x in range(0,1600,40))
   bits.append(f'<polyline points="{pts}" fill="none" stroke="{hot}" stroke-opacity=".13" stroke-width="3"/>')
 bits.append(f'<text x="1540" y="830" fill="{hot}" fill-opacity=".23" font-family="system-ui" font-size="27" font-weight="800" letter-spacing="10" text-anchor="end">{title}</text>')
 svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="{dark}"/><stop offset=".6" stop-color="{mid}"/><stop offset="1" stop-color="#13091f"/></linearGradient></defs>{''.join(bits)}</svg>'''
 (out/f'{mode}.svg').write_text(svg)
print('Created 6 original mode-specific gameplay wallpapers')
