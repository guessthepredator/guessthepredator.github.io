"""Original subdued tactile UI cues. No extracted game audio, voice synthesis, or loud sweeps.
Set uses soft filtered mechanical taps for hovering and gentle pitched pings for outcomes.
"""
from pathlib import Path
import wave, numpy as np
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets'/'sfx';OUT.mkdir(exist_ok=True)
SR=24000
specs={
    'nav':(.075,650,.065),'pick':(.095,760,.080),'clue':(.115,520,.090),
    'wrong':(.130,350,.075),'correct':(.160,780,.095),'win':(.245,770,.10),
    'lose':(.175,350,.070),'reveal':(.215,600,.080),
    'hover-classic':(.043,520,.038),'hover-pixel':(.044,560,.037),
    'hover-quote':(.042,490,.036),'hover-ability':(.043,590,.036),
    'hover-emoji':(.042,620,.037),'hover-map':(.043,535,.036),
}
for name,(length,freq,gain) in specs.items():
    n=max(10,int(length*SR));t=np.arange(n)/SR
    seed=sum((i+1)*ord(ch) for i,ch in enumerate(name))
    rng=np.random.default_rng(seed)
    raw=rng.standard_normal(n)
    # Smooth the transient so no brittle, harsh, digital click.
    colored=np.convolve(raw,np.ones(9)/9,'same')
    upper=np.sin(2*np.pi*freq*t)
    lower=np.sin(2*np.pi*freq*.5*t)
    is_hover=name.startswith('hover-')
    if is_hover:
        signal=.81*colored+.10*upper+.08*lower
    else:
        signal=.46*colored+.42*upper+.16*lower
        if name in ('correct','win','reveal'):
            signal+=.20*np.sin(2*np.pi*freq*1.25*t) * np.minimum(1,np.maximum(0,(t-.065)/.02))
    attack=np.minimum(1,t/(.009 if is_hover else .014))
    decay=(1-t/length)**(2.7 if is_hover else 2.25)
    samples=np.tanh(signal*.85)*attack*np.maximum(0,decay)
    samples*=gain/max(.01,float(np.max(np.abs(samples))))
    assert np.max(np.abs(samples))<=.101
    with wave.open(str(OUT/(name+'.wav')),'wb') as wav:
        wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(SR)
        wav.writeframes((samples*32767).astype('<i2').tobytes())
print('Wrote',len(specs),'original quiet tactile cues')
