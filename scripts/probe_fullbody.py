#!/usr/bin/env python3
"""Validate full-body character PNGs and remove their baked-in scene backgrounds.

GitHub Pages fetches these 5 public artwork renders at build time. Some
'Original X.png' artwork has a big red showcase panel and platform baked in,
even though its file is a PNG. The strict/release path produces a TRUE RGBA
foreground-only cutout, not just CSS object-fit tricks or a square face icon.

Art is the copyrighted property of Electronic Arts / Respawn Entertainment.
The site remains an independent, non-commercial fan project.
"""
from __future__ import annotations
import io
import os
import sys
from pathlib import Path
from urllib.parse import quote

import requests
from PIL import Image, ImageChops, ImageFilter

LEGENDS = ("alter", "ballistic", "catalyst", "conduit", "sparrow")
HEADERS = {
    "User-Agent": "GuessThePredatorFanSite/2.28 (verified noncommercial character-art cutout)",
    "Accept": "image/png,image/webp,image/*;q=0.8",
}


def urls(slug):
    name = slug.title()
    original = f"Original {name}.png"
    skins = {
        "alter": "Crimson Dynasty Alter.png",
        "ballistic": "Earl Grey Ballistic.png",
        "catalyst": "Crimson Goddess Catalyst.png",
        "conduit": "Clearwater Conduit.png",
        "sparrow": "Char Sparrow.png",
    }
    for filename in (original, skins[slug]):
        for domain in (
            "apexlegends.wiki.gg/wiki/Special:Redirect/file/",
            "apexlegends.fandom.com/wiki/Special:FilePath/",
        ):
            yield "https://" + domain + quote(filename)


def validate_raw(raw):
    im = Image.open(io.BytesIO(raw))
    im.load()
    w, h = im.size
    if w < 280 or h < 600 or h / w < 1.27:
        raise ValueError(f"Not a vertical full-body render: {w}x{h}")
    return im.convert("RGBA")


def remove_baked_background(image, session):
    """Segment only the figure, including any scenery INSIDE its PNG bounds."""
    from rembg import remove

    # Composite existing transparent pixels onto a solid neutral studio color.
    # This gives the segmentation model a predictable boundary without
    # introducing the PNG's black RGB values around transparent pixels.
    studio = Image.new("RGB", image.size, (29, 41, 60))
    studio.paste(image.convert("RGB"), mask=image.getchannel("A"))
    cutout = remove(studio, session=session, post_process_mask=True).convert("RGBA")

    # Never turn pixels that were already transparent in the source opaque.
    alpha = ImageChops.multiply(cutout.getchannel("A"), image.getchannel("A"))
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.6))
    cutout.putalpha(alpha)

    # Reject a missing, full-frame or near-empty mask. The corners must be
    # transparent; this catches accidentally unprocessed original images.
    w, h = cutout.size
    hist = alpha.histogram()
    transparent_ratio = sum(hist[:16]) / (w * h)
    opaque_ratio = sum(hist[220:]) / (w * h)
    if transparent_ratio < 0.30 or opaque_ratio < 0.04:
        raise ValueError(f"Unconvincing cutout alpha: transparent={transparent_ratio:.1%}, solid={opaque_ratio:.1%}")
    corners = [alpha.getpixel((x, y)) for x, y in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1))]
    if max(corners) > 15:
        raise ValueError(f"Original rectangular scene still visible at a corner: {corners}")
    bbox = alpha.getbbox()
    if not bbox or bbox[3] - bbox[1] < int(h * 0.48):
        raise ValueError(f"Cutout truncated too much of the Legend: {bbox}")
    return cutout, transparent_ratio, opaque_ratio


def main():
    strict = "--strict" in sys.argv
    out = Path(os.environ.get("OUTPUT_DIR", "/tmp/gtp-fullbody-probe"))
    out.mkdir(parents=True, exist_ok=True)
    session = None
    if strict:
        # Load model ONCE. rembg uses U2Net CPU and never uploads user files.
        from rembg import new_session
        session = new_session("u2net", providers=["CPUExecutionProvider"])
    found = []
    for slug in LEGENDS:
        print(f"==== {slug.upper()} ====", flush=True)
        for url in urls(slug):
            try:
                r = requests.get(url, headers=HEADERS, timeout=25, allow_redirects=True)
                print(f"HTTP {r.status_code} bytes={len(r.content)} {r.url[:150]}", flush=True)
                r.raise_for_status()
                image = validate_raw(r.content)
                if strict:
                    result, clear, opaque = remove_baked_background(image, session)
                    destination = out / ("cutout-" + slug + ".png")
                    result.save(destination, optimize=True)
                    print(
                        f"TRANSPARENT CUTOUT {slug}: {result.width}x{result.height}, "
                        f"background-clear={clear:.1%}, figure-solid={opaque:.1%}, "
                        f"PNG={destination.stat().st_size} bytes",
                        flush=True,
                    )
                else:
                    destination = out / ("original-" + slug + ".png")
                    image.save(destination)
                    print(f"OK FULL-BODY SOURCE {slug}: {image.width}x{image.height}", flush=True)
                found.append(slug)
                break
            except Exception as error:
                print(f"Unavailable/invalid: {str(error)[:180]}", flush=True)
        else:
            print(f"NO VERIFIED FULL-BODY FILE: {slug}", flush=True)
    print(f"VERIFIED {len(found)}/5: {', '.join(found)}", flush=True)
    if strict and len(found) != len(LEGENDS):
        raise SystemExit("ERROR: A full-body portrait cutout failed; protect the previous live release.")


if __name__ == "__main__":
    main()
