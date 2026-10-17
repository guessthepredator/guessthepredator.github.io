#!/usr/bin/env python3
"""Generate 14 original, NON-VERBAL UI sounds. No voices, TTS, or samples.
Subtle analog-style pips, muted taps and glassy confirmations; peak <= 0.19.
"""
from pathlib import Path
import numpy as np, wave
SR=32000; folder=Path(__file__).resolve().parents[1]/'assets'/'sfx';folder.mkdir(exist_ok=True)
settings={
'nav':(.08,410,.08),'pick':(.10,460,.09),'clue':(.17,520,.13),
'wrong':(.16,310,.10),'correct':(.20,650,.14),'win':(.35,590,.17),
'lose':(.19,250,.09),'reveal':(.28,490,.13),
'hover-classic':(.048,390,.055),'hover-pixel':(.052,495,.05),
'hover-quote':(.05,440,.05),'hover-ability':(.055,530,.056),
'hover-emoji':(.051,570,.05),'hover-map':(.054,370,.054),
}
for name,(length,freq,peak) in settings.items():
 N=int(SR*length);t=np.arange(N)/SR
 rng=np.random.default_rng(sum((i+1)*ord(c) for i,c in enumerate(name)))
 hover=name.startswith('hover-')
 # A rounded metallic click plus muted, plucked tuned sine. Distinct from speech.
 curve=freq*(1+.06*np.exp(-t*34))
 phase=2*np.pi*np.cumsum(curve)/SR
 note=np.sin(phase)+.23*np.sin(phase*2.03+.4)
 if name in ('win','correct','reveal'):
  lift=.29*np.sin(2*np.pi*freq*1.50*t+.2)*np.maximum(0,1-np.abs(t-length*.48)/(length*.34))
 else: lift=0
 if name in ('wrong','lose'):
  note=np.sin(2*np.pi*(freq*t-95*t*t))+.1*np.sin(2*np.pi*(freq/2)*t)
 noise=rng.standard_normal(N)
 # Low-pass the noise for soft mechanical texture; no hissy pulses or high notes.
 smooth=np.convolve(noise,np.ones(31)/31,mode='same')
 signal=.8*note+.10*smooth+lift
 attack=np.minimum(1,t/(.007 if hover else .012))
 envelope=attack*np.exp(-t/(length*(.24 if hover else .30)))
 signal=np.tanh(signal*.7)*envelope
 signal*=peak/max(.01,float(np.max(np.abs(signal))))
 # small fade to zero ensures click-free file boundaries
 fade=max(2,int(SR*.006));signal[-fade:]*=np.linspace(1,0,fade)
 with wave.open(str(folder/(name+'.wav')),'wb') as f:
  f.setnchannels(1);f.setsampwidth(2);f.setframerate(SR);f.writeframes((signal*32767).astype('<i2').tobytes())
 print(name,round(length*1000),'ms',round(float(np.max(np.abs(signal))),3),'peak')
