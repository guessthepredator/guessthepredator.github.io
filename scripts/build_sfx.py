"""Create soft original synth UI sound effects. These are musical tones, NEVER synthetic speech."""
from pathlib import Path
import numpy as np,wave,math
ROOT=Path(__file__).resolve().parents[1];out=ROOT/'assets/sfx';out.mkdir(exist_ok=True)
sr=32000
CUES={
'hover-classic':([392,588],.16), 'hover-pixel':([523,659],.14),
'hover-quote':([330,494],.15),'hover-ability':([440,660],.15),
'hover-emoji':([587,740],.14),'hover-map':([370,554],.15),
'nav':([392,494,587],.18),'pick':([494,659],.20),
'clue':([370,494,740],.34),'correct':([440,550,660],.32),
'wrong':([370,277],.30),'win':([392,494,587,784],.62),
'lose':([392,330,261],.58),'reveal':([330,494,659,880],.72)}
for cue,(notes,dur) in CUES.items():
 n=int(sr*dur);t=np.arange(n)/sr
 waveforms=np.zeros(n,dtype=np.float64)
 for i,f in enumerate(notes):
  delay=i*0.038 if dur>.4 else i*.025
  shifted=np.maximum(0,t-delay)
  env=np.where(t>=delay,np.exp(-shifted*(5 if dur<.4 else 3.8)),0)
  tone=np.sin(2*np.pi*f*shifted+.08*np.sin(2*np.pi*5*shifted))
  tone+=.12*np.sin(2*np.pi*(f/2)*shifted)
  waveforms+=tone*env/(len(notes)**.6)
 attack=np.minimum(1,t/.018)
 release=np.minimum(1,np.maximum(0,(dur-t)/.06))
 waveforms*=attack*release
 peak=max(1,np.max(np.abs(waveforms)))
 waveforms=waveforms/peak*.36
 samples=(waveforms*32767).astype('<i2')
 with wave.open(str(out/f'{cue}.wav'),'wb') as f:
  f.setnchannels(1);f.setsampwidth(2);f.setframerate(sr);f.writeframes(samples.tobytes())
print('Authored',len(CUES),'soft, original UI SFX (no spoken/sampled content)')
