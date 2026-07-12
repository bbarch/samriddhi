#!/usr/bin/env python3
"""
Inbox filer.

Drop images into inbox/artwork/ or inbox/photos/ and push. For each image:
  filename            → title      ("Rainbow Unicorn.jpg" → "Rainbow Unicorn")
  photo EXIF date     → date       (falls back to today)
  the image itself    → auto-rotated, resized to 1600px, saved to images/<kind>/

Then the gallery entry is added and the inbox file is removed.
Runs in GitHub Actions on every push that touches inbox/, or locally:
  python3 scripts/file_inbox.py
"""

import re
import sys
from datetime import datetime
from pathlib import Path

from PIL import Image, ImageOps

try:
    from pillow_heif import register_heif_opener  # iPhone HEIC support
    register_heif_opener()
except ImportError:
    pass

ROOT = Path(__file__).resolve().parent.parent
KINDS = {"artwork": "ARTWORK", "photos": "PHOTOS"}
EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".heic", ".webp"}
MAX_WIDTH = 1600
JPEG_QUALITY = 85


def slugify(text):
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s[:60] or "memory"


def js_string(s):
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def exif_date(img):
    """Date the photo was taken, from EXIF; None if absent."""
    try:
        raw = img.getexif().get(36867) or img.getexif().get(306)  # DateTimeOriginal, DateTime
        return datetime.strptime(raw[:10], "%Y:%m:%d")
    except Exception:
        return None


def insert_entry(kind, const_name, entry):
    content_file = ROOT / "content" / f"{kind}.js"
    text = content_file.read_text(encoding="utf-8")
    block = (
        "\n  {\n"
        f'    title: {js_string(entry["title"])},\n'
        f'    image: {js_string(entry["image"])},\n'
        f'    date: {js_string(entry["date"])},\n'
        "  },"
    )
    marker = re.compile(r"(const\s+" + const_name + r"\s*=\s*\[)")
    new_text, n = marker.subn(r"\1" + block, text, count=1)
    if n == 0:
        raise RuntimeError(f"Could not find 'const {const_name} = [' in {content_file}")
    content_file.write_text(new_text, encoding="utf-8")


def file_image(path, kind, const_name):
    # Strip a filed-style date prefix if present, so re-dropping an
    # already-filed image can't create "2026-07-2026-07-…" names.
    title = re.sub(r"^\d{4}-\d{2}-", "", path.stem).strip()

    # Duplicate guard: if an entry with this title already exists,
    # leave the file in the inbox and warn instead of double-publishing.
    content_text = (ROOT / "content" / f"{kind}.js").read_text(encoding="utf-8")
    entries_part = content_text[content_text.find(f"const {const_name}"):]
    if f"title: {js_string(title)}," in entries_part:
        print(f"  SKIPPED {path.name}: \"{title}\" is already on the site. "
              f"If this is a NEW memory, rename the file and push again.")
        return False

    try:
        img = Image.open(path)
        img = ImageOps.exif_transpose(img)
    except Exception as e:
        print(f"  SKIPPED {path.name}: cannot read image ({e})")
        return False

    when = exif_date(img) or datetime.now()
    if img.width > MAX_WIDTH:
        img = img.resize((MAX_WIDTH, int(img.height * MAX_WIDTH / img.width)))
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    dest_dir = ROOT / "images" / kind
    dest_dir.mkdir(parents=True, exist_ok=True)
    base = f"{when.strftime('%Y-%m')}-{slugify(title)}"
    dest = dest_dir / f"{base}.jpg"
    n = 2
    while dest.exists():
        dest = dest_dir / f"{base}-{n}.jpg"
        n += 1
    img.save(dest, "JPEG", quality=JPEG_QUALITY)

    insert_entry(kind, const_name, {
        "title": title,
        "image": f"images/{kind}/{dest.name}",
        "date": when.strftime("%B %Y"),
    })
    path.unlink()
    print(f"  FILED {path.name} → {kind}: \"{title}\" ({when.strftime('%B %Y')})")
    return True


def main():
    filed = 0
    skipped = []
    for kind, const_name in KINDS.items():
        folder = ROOT / "inbox" / kind
        if not folder.is_dir():
            continue
        for path in sorted(folder.iterdir()):
            if path.name in ("README.txt", ".gitkeep") or path.name.startswith("."):
                continue
            if path.suffix.lower() not in EXTENSIONS:
                skipped.append(path.name)
                continue
            if file_image(path, kind, const_name):
                filed += 1

    print(f"done: {filed} image(s) filed")
    if skipped:
        print("left in inbox (not images):", ", ".join(skipped))
    # Fail loudly if something was dropped in but nothing could be filed
    if filed == 0 and skipped:
        sys.exit(1)


if __name__ == "__main__":
    main()
