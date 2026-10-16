"""Create original POI-specific schematic clue art (NOT Apex gameplay screenshots).
No third-party assets. Every scene is generated from a supplied POI clue using original vector primitives.
"""
from pathlib import Path
from html import escape
import json, math, random, re
ROOT=Path(__file__).resolve().parents[1]
items=json.loads((ROOT/'assets/map-catalog.json').read_text())
out=ROOT/'assets/map-recon';out.mkdir(exist_ok=True)
PALETTES={
'Kings Canyon':('#1f183c','#a44e64','#efaa55','#ffbf8b'),
'World’s Edge':('#161b3b','#5c4676','#e46d3f','#8addff'),
'Olympus':('#153056','#5968aa','#edbdcf','#b6fff2'),
'Storm Point':('#082f3f','#268b79','#e0b989','#abfce8'),
'Broken Moon':('#17233b','#544484','#b9a4e9','#86dbe8'),
'E-District':('#120e39','#602a77','#fd5baf','#52eaff')}
# Art tags encode architectural features visible in each scene, not generic random locations.
FEATURES={
'kc-caustic-exterior':('industrial','towers','vats','pipes'),
'kc-caustic-interior':('interior','vats','walkway','pipes'),
'kc-crypto-interior':('interior','screens','console','grid'),
'kc-bunker':('interior','corridor','blastdoor','grid'),
'kc-gauntlet':('industrial','ramps','arches','track'),
'kc-cage':('industrial','scaffold','catwalk','tower'),
'we-big-maude':('terrain','ship','vents','platform'),
'we-big-maude-interior':('interior','workshop','crane','workbench'),
'we-lava':('terrain','lava','bridges','pipes'),
'we-climatizer':('terrain','ice','dish','towers'),
'we-countdown':('industrial','ring','gantry','towers'),
'we-trials':('interior','arena','ice','arches'),
'ol-bonsai':('city','towers','bonsai','platform'),
'ol-estates':('terrain','villas','trees','walkway'),
'ol-estates-interior':('interior','villa','window','stairs'),
'ol-hammond':('interior','lab','reactor','glass'),
'ol-rift':('city','portal','platform','rings'),
'ol-oasis':('city','twintowers','gardens','pool'),
'sp-barometer':('terrain','dish','weather','platform'),
'sp-command':('terrain','fortress','mountain','antenna'),
'sp-command-interior':('interior','shaft','elevator','catwalk'),
'sp-catcher':('terrain','ring','platform','turbine'),
'sp-mill':('terrain','windmill','huts','shore'),
'sp-lightning':('terrain','antenna','towers','storm'),
'bm-terraformer':('terrain','terraformer','monolith','dome'),
'bm-production':('industrial','factory','pipes','gantry'),
'bm-production-interior':('interior','factory','conveyor','beams'),
'bm-core':('interior','reactor','ring','platform'),
'bm-stasis':('terrain','antenna','arrays','dome'),
'bm-alpha':('terrain','moonbase','dome','antenna'),
'ed-city-hall':('city','civic','fountain','plaza'),
'ed-city-hall-interior':('interior','lobby','columns','stairs'),
'ed-boardwalk':('city','neon','waterfront','bridge'),
'ed-boardwalk-interior':('interior','club','neon','bar'),
'ed-galleria':('interior','mall','dome','escalator'),
'ed-neon':('city','neon','billboard','towers')}

def poly(points,fill,stroke='#ffffff50',sw=2):return f'<polygon points="{points}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
def rect(x,y,w,h,fill,rx=0,stroke='none',sw=2):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
def line(x1,y1,x2,y2,stroke,width=3):return f'<path d="M{x1} {y1} L{x2} {y2}" fill="none" stroke="{stroke}" stroke-width="{width}"/>'
def circ(x,y,r,fill,stroke='none',sw=3):return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
def txt(x,y,s,size=20,fill='#e8efff',anchor='start'):return f'<text x="{x}" y="{y}" font-family="system-ui, sans-serif" font-size="{size}" fill="{fill}" text-anchor="{anchor}" letter-spacing="3" font-weight="750">{escape(s)}</text>'
def feature(key,rng,a,b,accent):
 v=[];T=f'#'+accent
 if key in ['towers','twintowers','fortress','civic','moonbase','factory','villas','villa','lobby','mall']:
  if key=='twintowers':spans=[(245,155,180,330),(595,90,180,395)]
  elif key=='villas':spans=[(190,280,210,185),(510,240,230,220)]
  elif key=='factory':spans=[(140,265,700,215)]
  elif key=='civic':spans=[(300,220,400,270)]
  elif key=='moonbase':spans=[(135,315,280,165),(590,275,285,205)]
  else:spans=[(205,185,210,295),(530,135,235,340)]
  for x,y,w,h in spans:
   v.extend([rect(x,y,w,h,'#1b2039',5,'#adceff88',4),poly(f'{x},{y} {x+40},{y-35} {x+w-40},{y-35} {x+w},{y}', '#36405c','#ffffff75',3)])
   for xx in range(x+18,x+w-15,47):
    for yy in range(y+26,min(465,y+h-12),43):v.append(rect(xx,yy,24,11,a,2))
  if key=='civic':v.append(poly('290,215 500,95 710,215','#b6afd0','#eaf2ff',4))
  if key=='villa':v+= [rect(620,135,55,335,'#192338'),rect(670,135,55,335,'#192338')]
 if key in ['screens','console','grid']:
  for i in range(4):
   x=135+i*190
   v.extend([rect(x,155,155,126,'#090f26',9,'#7beafa',4),rect(x+15,172,126,78,'#0c5e79',4)])
   for j in range(5):v.append(line(x+23,195+j*11,x+123,195+j*11,'#9df6f766',2))
  v.append(rect(220,335,560,100,'#10162a',9,'#bceafb',3))
 if key in ['vats','reactor','lab','terraformer','weather']:
  for x in [250,505,730]:
   v.extend([rect(x-60,235,115,238,'#152c45',30,'#96f6fa',4),rect(x-44,250,83,195,'#49a49c44',25),line(x-28,250,x-28,444,'#e5ffb4',3)])
  if key=='reactor':v+=[circ(500,290,140,'none','#b1efff88',18),circ(500,290,78,'#e6a8fe44','#f3c0ff',9)]
 if key in ['corridor','blastdoor','shaft','elevator','lobby']:
  v += [poly('60,535 290,195 710,195 950,535','#20283d','#a9baff',4),poly('60,0 290,195 290,520 60,535','#182238','#87aedfa8',3),poly('950,0 710,195 710,520 950,535','#192035','#87aedfa8',3)]
  for y in [245,315,395]:v.append(line(80,y,900,y,'#97c9ec58',2))
  v.append(rect(395,186,210,270,'#0c1024',7,'#7fe3fa',7));v.append(rect(420,210,160,222,'#375273',3))
 if key in ['ring','portal','rings','arches','arena']:
  v += [circ(500,305,205,'none','#acdcff',18),circ(500,305,157,'none','#fa78d5aa',7),circ(500,305,112,'#1f173f','#b4f8fc',9)]
  if key=='portal':v.append(circ(500,305,98,'#d695e87f'))
 if key in ['turbine','windmill','dish','antenna','arrays','monolith']:
  v.append(rect(482,218,36,290,'#273c50',6,'#b7d9ef',4))
  v += [circ(500,226,40,'#13172e','#9eeefd',6)]
  for j in range(5):
   th=j*2*math.pi/5;xx=500+175*math.cos(th);yy=226+145*math.sin(th)
   v.append(poly(f'500,226 {int(xx)}, {int(yy)} {int(500+65*math.cos(th+.5))},{int(226+50*math.sin(th+.5))}','#e4deff77','#e8f5ff',2))
  if key=='antenna':v += [line(500,70,500,226,'#f4a9e0',7),circ(500,75,15,'#ffa9ec')]
 if key in ['trees','bonsai','gardens']:
  for x in [195,340,710,840]:
   v += [rect(x-8,300,16,190,'#31243a'),circ(x,300,77,'#52a77d88','#8cf7ae',3),circ(x+42,288,48,'#68bf8cbb')]
 if key in ['waterfront','shore','pool']:
  v.append(poly('0,460 1000,460 1000,570 0,570','#174d6a','#82f7fb',2))
  for j in range(14): v.append(line(j*84,508+j%3*13,j*84+40,508+j%3*13,'#a8fafa77',3))
 if key in ['lava']:
  v.append(poly('0,464 1000,414 1000,570 0,570','#a7422f','#feaa56',4))
  for j in range(8):v.append(line(j*130,497,j*130+74,520,'#ffcf70',6))
 if key in ['bridges','catwalk','walkway','platform','plaza','track','ramps','stairs','escalator']:
  v += [poly('48,435 952,405 940,470 65,512','#56627b','#d8dfff',4)]
  for x in range(95,925,83):v.append(line(x,415,x,478,'#bce9ff',3))
  if key in ['ramps','escalator','stairs']:v.append(poly('140,430 690,240 765,240 275,470','#e28db366','#f5bedc',4))
 if key in ['ship']:
  v += [poly('100,350 790,290 880,400 700,465 180,465','#1a2b47','#aff3ff',5),rect(295,220,325,145,'#303b55',18,'#ffe0d4',3),poly('370,220 545,145 665,210','#56617a','#f6ffff',4)]
 if key in ['neon','billboard','club']:
  for x,s in [(225,'◈'),(625,'✧')]:
   v.extend([rect(x,150,175,165,'#1b103a',8,'#ff70d9',8),txt(x+87,240,s,70,'#ff92d4','middle')])
 if key in ['glass','window','dome']:
  v += [poly('130,425 290,140 710,140 880,425','#5ad8de29','#bcfaff',7)]
 if key in ['scaffold','gantry','beams','crane']:
  for x in [145,440,735]:
   v.extend([rect(x,120,28,355,'#687085',2,'#e7ddff',2),line(x,125,x+165,430,'#a8b1d5',5),line(x+165,125,x,430,'#a8b1d5',5)])
 if key in ['ice','mountain']:
  for x in [0,220,600,900]:v.append(poly(f'{x-90},460 {x+120},115 {x+315},460','#8dc4d944','#bdf6ff',2))
 if key in ['huts','workshop','workbench','bar','conveyor']:
  for x in [150,555]:v.extend([rect(x,345,290,116,'#2a314b',10,'#b9ddff',4),rect(x+36,315,210,28,'#d8abd7',5)])
 if key in ['fountain']:
  v+= [circ(500,452,125,'#304d66','#99e7f8',5),line(500,315,500,450,'#9bffff',13),circ(500,303,19,'#bdffff')]
 if key in ['storm']:
  v+= [poly('720,60 665,205 735,200 625,370 800,168 722,168','#e5f4ff','#d3f4ff',3)]
 return v

def build(entry):
  id=entry['id'];scene,*tokens=FEATURES[id];colorA,colorB,accent,light=PALETTES[entry['map']]
  rng=random.Random(sum(ord(c) for c in id));a=colorA;b=colorB
  exterior=entry['kind']!='Interior'
  bg=f'<rect width="1000" height="570" fill="url(#sky)"/>'
  if exterior:
   for j in range(6):
    x=-120+j*210;bg+=poly(f'{x},425 {x+145},{140+rng.randrange(100)} {x+340},425',colorB+'66','none')
   bg+=poly('0,455 180,390 420,452 650,399 1000,449 1000,570 0,570','#131c38','#7189bc44',2)
  else:
   bg+=poly('0,0 220,145 220,570 0,570','#15223a','#5974aa',3)+poly('1000,0 790,145 790,570 1000,570','#18243c','#5974aa',3)
   bg+=poly('220,440 790,440 1000,570 0,570','#1c243d','#819abc',2)
  deco=[]
  for j in range(24):
   x=rng.randrange(20,990);y=rng.randrange(55,340)
   deco.append(circ(x,y,rng.randrange(1,3),'#f8dfff9c'))
  for key in tokens:deco += feature(key,rng,colorB,colorA,accent)
  frame=rect(24,24,952,522,'none',14,'#ffdbf77a',3)+line(34,100,965,100,'#ffffff35',2)
  return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 570" width="1000" height="570" role="img" aria-label="Stylized architectural clue, not an Apex screenshot">
 <defs><linearGradient id="sky" x1="0" y1="0" x2="1" y2="1"><stop stop-color="{colorA}"/><stop offset="0.58" stop-color="{colorB}"/><stop offset="1" stop-color="{accent}"/></linearGradient><radialGradient id="glow"><stop stop-color="{light}" stop-opacity=".6"/><stop offset="1" stop-color="{light}" stop-opacity="0"/></radialGradient></defs>
 {bg}<circle cx="650" cy="200" r="340" fill="url(#glow)"/>{''.join(deco)}
 <rect x="0" y="0" width="1000" height="570" fill="none" stroke="#10172f" stroke-width="4"/>{frame}
 {txt(46,68,'RECON VISUAL  /  '+('INTERIOR' if not exterior else 'EXTERIOR'),18,'#ffe3f8')}
 {txt(940,68,'? / ? SCAN',15,'#e8f9ff','end')}
 <rect x="27" y="517" width="945" height="28" fill="#080f23b8"/>
 {txt(43,536,'ORIGINAL SCHEMATIC CLUE - NOT GAMEPLAY FOOTAGE',12,'#a7f8fa')}
 </svg>'''
for item in items:
 (out/f"{item['id']}.svg").write_text(build(item),encoding='utf-8')
print('rendered',len(items),'POI-specific vector recon cards')
