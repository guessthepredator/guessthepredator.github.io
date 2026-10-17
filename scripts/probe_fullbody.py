#!/usr/bin/env python3
"""Probe public wiki-render URLs for genuine tall art; do not accept face icons."""
from __future__ import annotations
import io
import os
from pathlib import Path
import requests
from PIL import Image
from urllib.parse import quote
LEGENDS=("alter","ballistic","catalyst","conduit","sparrow")
HEADERS={"User-Agent":"GuessThePredatorFanSite/2.27 (art asset verification; non-commercial)", "Accept":"image/avif,image/webp,image/png,image/*;q=0.8"}
def urls(slug):
    name=slug.title()
    filename=f"Original {name}.png"
    for domain in ("apexlegends.wiki.gg/wiki/Special:Redirect/file/","apexlegends.fandom.com/wiki/Special:FilePath/"):
        yield "https://"+domain+quote(filename)
    # The alternate skin render is still a real full-body pose, not a face icon.
    skins={"alter":"Crimson Dynasty Alter.png","ballistic":"Earl Grey Ballistic.png","catalyst":"Crimson Goddess Catalyst.png","conduit":"Clearwater Conduit.png","sparrow":"Char Sparrow.png"}
    yield "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/"+quote(skins[slug])
    yield "https://apexlegends.fandom.com/wiki/Special:FilePath/"+quote(skins[slug])
def validate(raw):
    img=Image.open(io.BytesIO(raw))
    img.load()
    w,h=img.size
    if w<280 or h<600 or h/w<1.27:
        raise ValueError(f"not a tall full-body render: {w}x{h}")
    return img,(w,h)
def main():
    out=Path(os.environ.get("OUTPUT_DIR","/tmp/gtp-fullbody-probe"))
    out.mkdir(parents=True,exist_ok=True)
    found=[]
    for slug in LEGENDS:
        print(f"==== {slug.upper()} ====",flush=True)
        for url in urls(slug):
            try:
                r=requests.get(url,headers=HEADERS,timeout=17,allow_redirects=True)
                print(f"HTTP {r.status_code} {r.headers.get('content-type')} bytes={len(r.content)} {r.url[:170]}",flush=True)
                r.raise_for_status()
                img,dim=validate(r.content)
                img.save(out/(slug+".png"))
                print(f"OK FULL-BODY {slug}: {dim[0]}x{dim[1]}",flush=True)
                found.append(slug)
                break
            except Exception as e:
                print(f"Unavailable: {str(e)[:160]}",flush=True)
        else: print(f"NO VERIFIED FULL-BODY FILE: {slug}",flush=True)
    print(f"VERIFIED {len(found)}/5: {', '.join(found)}",flush=True)
    # probe only; do not block other releases
if __name__=="__main__":main()
