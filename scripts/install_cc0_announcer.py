#!/usr/bin/env python3
"""Install real, CC0 human-spoken Kenney announcer clips (no TTS, no game rip).

Usage:
  python3 scripts/install_cc0_announcer.py [path/to/Voiceover Pack.zip]
  python3 scripts/install_cc0_announcer.py --auto  # downloads from credited CC0 upstream

The deployment does not fail when the independent source is temporarily offline:
it simply omits the voice pack and keeps text+original UI SFX functional.
"""
from pathlib import Path
import io, sys, urllib.request, zipfile, json, shutil
root=Path(__file__).resolve().parents[1]
dest=root/'assets/announcer';dest.mkdir(exist_ok=True)
source='https://opengameart.org/sites/default/files/Voiceover%20Pack.zip'
selections={'ready':'ready','mission_completed':'mission_completed',
            'mission_failed':'mission_failed','objective_achieved':'objective_achieved',
            'correct':'correct','wrong':'wrong','you_win':'you_win','time_over':'time_over'}

def run(file):
 with zipfile.ZipFile(file) as z:
  all_names=[n for n in z.namelist() if n.lower().endswith('.ogg')]
  if not all_names:raise RuntimeError('No OGG files found in archive')
  entries=[]
  for cue,stem in selections.items():
   matches=[n for n in all_names if Path(n).stem.casefold()==stem and 'female' in n.lower()]
   if not matches:matches=[n for n in all_names if Path(n).stem.casefold()==stem]
   if not matches:continue
   raw=z.read(matches[0])
   if len(raw)<500 or not raw.startswith(b'OggS'):
    raise RuntimeError(f'Invalid OGG stream: {matches[0]}')
   (dest/f'{cue}.ogg').write_bytes(raw)
   entries.append({'cue':cue,'file':f'{cue}.ogg','source':matches[0]})
  if len(entries)<5:raise RuntimeError(f'Only {len(entries)} recognized clips. Archive layout unexpected.')
  (dest/'manifest.json').write_text(json.dumps({'source':'Kenney Voiceover Pack', 'license':'CC0 1.0',
     'source_url':'https://kenney.nl/assets/voiceover-pack','source_archive':source,
     'human_recorded':True,'clips':entries},indent=2)+'\n')
  print(f'INSTALLED {len(entries)} verified human CC0 OGG clips')

if __name__=='__main__':
 try:
  if len(sys.argv)>1 and sys.argv[1]!='--auto':run(Path(sys.argv[1]))
  else:
   request=urllib.request.Request(source,headers={'User-Agent':'GTP2-CC0-Installer/1.0'})
   with urllib.request.urlopen(request,timeout=25) as response:
    data=response.read(8_000_000)
   run(io.BytesIO(data))
 except Exception as ex:
  if len(sys.argv)>1 and sys.argv[1]=='--auto':
   print(f'Optional CC0 announcer unavailable, keeping game functional: {ex}')
  else:raise
