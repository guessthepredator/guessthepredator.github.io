"""Human-authored interface sound design, no voice synthesis or extracted game audio.
Light arcade-tactile percussive chirps with modest loudness, deliberate silences, and no jarring chords.
"""
from pathlib import Path
import numpy as np,wave
ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'assets/sfx'; OUT.mkdir(exist_ok=True)
SR=32000
# short chirps are quieter and less tonal than the previous multi-note melodies
SPECS={
 'nav':(.105,340,475,.11), 'pick':(.14,440,680,.14),'clue':(.19,340,700,.16),
 'correct':(.24,480,860,.17),'wrong':(.16,330,230,.095),'win':(.35,450,740,.18),
 'lose':(.24,340,260,.085),'reveal':(.30,370,920,.17),
 'hover-classic':(.065,370,470,.055),'hover-pixel':(.070,430,620,.058),
 'hover-quote':(.060,310,400,.049),'hover-ability':(.063,450,580,.054),
 'hover-emoji':(.065,520,650,.054),'hover-map':(.064,340,460,.052)
}
for name,(dur,f0,f1,level) in SPECS.items():
 n=int(SR*dur); t=np.arange(n,dtype=np.float64)/SR
 freq=f0+(f1-f0)*(t/dur)**.78
 phase=2*np.pi*np.cumsum(freq)/SR
 tone=np.sin(phase)*.65+.18*np.sin(phase*1.97)
 # original glassy click texture, deterministic, extremely soft
 rng=np.random.default_rng(sum(ord(c) for c in name)+41)
 noise=rng.normal(size=n)
 noise=np.diff(np.r_[0,noise]);noise=np.tanh(noise)*.12
 attack=np.clip(t/.006,0,1);decay=np.maximum(0,1-t/dur)**2.3
 clip=(tone+noise)*attack*decay
 # reduce sharp first milliseconds
 clip=np.clip(clip*level,-.28,.28)
 with wave.open(str(OUT/(name+'.wav')),'wb') as f:
  f.setnchannels(1);f.setsampwidth(2);f.setframerate(SR)
  f.writeframes((clip*32767).astype('<i2').tobytes())
print('Built',len(SPECS),'quiet original UI cues')
