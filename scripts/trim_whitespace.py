#!/usr/bin/env python3
"""
Trim uniform light borders (e.g. slide export with extra white on right/bottom).

Requires: pip install Pillow (use a venv: python3 -m venv .venv && source .venv/bin/activate)

Example:
  python scripts/trim_whitespace.py in.png out.png
  python scripts/trim_whitespace.py in.png out.png --fuzz 25
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    from PIL import Image, ImageChops
except ImportError:
    print("Install Pillow: python3 -m venv .venv && . .venv/bin/activate && pip install Pillow", file=sys.stderr)
    sys.exit(1)


def trim_uniform_border(im: Image.Image, fuzz: int = 18) -> tuple[Image.Image, tuple[int, int, int, int] | None]:
    im = im.convert("RGB")
    w, h = im.size
    corners = [
        im.getpixel((0, 0)),
        im.getpixel((w - 1, 0)),
        im.getpixel((0, h - 1)),
        im.getpixel((w - 1, h - 1)),
    ]
    border_color = tuple(int(round(sum(c[i] for c in corners) / len(corners))) for i in range(3))
    bg = Image.new("RGB", im.size, border_color)
    diff = ImageChops.difference(im, bg)
    r, g, b = diff.split()
    mask = ImageChops.lighter(ImageChops.lighter(r, g), b)
    mask = mask.point(lambda p: 255 if p > fuzz else 0)
    bbox = mask.getbbox()
    if not bbox:
        return im, None
    return im.crop(bbox), bbox


def main() -> None:
    p = argparse.ArgumentParser(description="Crop away near-uniform white margins from an image.")
    p.add_argument("input", type=Path)
    p.add_argument("output", type=Path)
    p.add_argument("--fuzz", type=int, default=18, help="Max RGB diff from corner average to still count as background (default 18)")
    args = p.parse_args()
    if not args.input.is_file():
        print(f"Not found: {args.input}", file=sys.stderr)
        sys.exit(1)
    im = Image.open(args.input)
    trimmed, bbox = trim_uniform_border(im, fuzz=args.fuzz)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    ext = args.output.suffix.lower()
    if ext in (".jpg", ".jpeg"):
        trimmed.convert("RGB").save(args.output, quality=92, optimize=True)
    else:
        trimmed.save(args.output, optimize=True)
    print(f"{args.input.name} {im.size} -> {trimmed.size} bbox={bbox}")


if __name__ == "__main__":
    main()
