#!/usr/bin/env python3
"""
Email → Memory importer.

Reads unseen emails from a Gmail inbox and turns each one into a site entry:
  Subject          → title   (start with "art:" to file under Artwork; default is Photos)
  Body             → description (a line starting with "Tags:" becomes tags)
  Image attachment → resized and saved into images/artwork/ or images/photos/

Environment variables (set as GitHub Actions secrets):
  GMAIL_ADDRESS       the dedicated Gmail address
  GMAIL_APP_PASSWORD  a Google "App password" for that account
  ALLOWED_SENDERS     comma-separated list of emails allowed to post
"""

import email
import email.policy
import imaplib
import io
import os
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
MAX_WIDTH = 1600
JPEG_QUALITY = 85


def slugify(text):
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s[:60] or "memory"


def parse_body(msg):
    """Return (description, tags) from the email body."""
    body = msg.get_body(preferencelist=("plain",))
    text = body.get_content().strip() if body else ""
    tags = []
    lines = []
    for line in text.splitlines():
        m = re.match(r"^\s*tags?\s*:\s*(.+)$", line, re.IGNORECASE)
        if m:
            tags = [t.strip() for t in m.group(1).split(",") if t.strip()]
        else:
            lines.append(line)
    description = " ".join(l.strip() for l in lines if l.strip())
    # Strip mobile signatures
    description = re.sub(r"Sent from my \w+.*$", "", description).strip()
    return description, tags


def save_image(part, dest_dir, slug, index):
    """Resize and save an image attachment. Returns relative path or None."""
    data = part.get_payload(decode=True)
    if not data:
        return None
    try:
        img = Image.open(io.BytesIO(data))
        img = ImageOps.exif_transpose(img)  # respect phone rotation
    except Exception as e:
        print(f"  skipping unreadable attachment ({e})")
        return None
    if img.width < 200 or img.height < 200:
        return None  # signature icons, logos, emoji
    if img.width > MAX_WIDTH:
        img = img.resize((MAX_WIDTH, int(img.height * MAX_WIDTH / img.width)))
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")
    suffix = f"-{index}" if index > 1 else ""
    filename = f"{slug}{suffix}.jpg"
    dest_dir.mkdir(parents=True, exist_ok=True)
    img.save(dest_dir / filename, "JPEG", quality=JPEG_QUALITY)
    return filename


def js_string(s):
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def insert_entry(content_file, const_name, entry):
    """Insert an entry object at the top of the const array in a content JS file."""
    text = content_file.read_text(encoding="utf-8")
    lines = [f'    title: {js_string(entry["title"])},']
    lines.append(f'    image: {js_string(entry["image"])},')
    lines.append(f'    date: {js_string(entry["date"])},')
    if entry.get("description"):
        lines.append(f'    description: {js_string(entry["description"])},')
    if entry.get("tags"):
        tags = ", ".join(js_string(t) for t in entry["tags"])
        lines.append(f"    tags: [{tags}],")
    block = "\n  {\n" + "\n".join(lines) + "\n  },"
    marker = re.compile(r"(const\s+" + const_name + r"\s*=\s*\[)")
    new_text, n = marker.subn(r"\1" + block.replace("\\", "\\\\"), text, count=1)
    if n == 0:
        raise RuntimeError(f"Could not find 'const {const_name} = [' in {content_file}")
    content_file.write_text(new_text, encoding="utf-8")


def process_message(msg):
    subject = (msg.get("Subject") or "Untitled").strip()
    if subject.lower().startswith("art:"):
        kind, const_name = "artwork", "ARTWORK"
        subject = subject[4:].strip() or "Untitled"
    else:
        kind, const_name = "photos", "PHOTOS"

    description, tags = parse_body(msg)
    try:
        when = email.utils.parsedate_to_datetime(msg.get("Date"))
    except Exception:
        when = datetime.now()
    date_label = when.strftime("%B %Y")
    slug = f"{when.strftime('%Y-%m')}-{slugify(subject)}"

    saved = []
    # Walk every part: phones often embed photos "inline" rather than as
    # attachments, so we accept any image part however the mail app labels it.
    for part in msg.walk():
        if part.get_content_maintype() == "multipart":
            continue
        is_image = part.get_content_maintype() == "image" or (
            part.get_filename() or ""
        ).lower().endswith((".jpg", ".jpeg", ".png", ".gif", ".heic", ".webp"))
        if not is_image:
            continue
        filename = save_image(part, ROOT / "images" / kind, slug, len(saved) + 1)
        if filename:
            saved.append(filename)

    if not saved:
        print(f"  no usable images in '{subject}', skipping")
        return False

    for i, filename in enumerate(reversed(saved)):
        entry = {
            "title": subject if len(saved) == 1 else f"{subject} ({len(saved) - i}/{len(saved)})",
            "image": f"images/{kind}/{filename}",
            "date": date_label,
            "description": description,
            "tags": tags,
        }
        insert_entry(ROOT / "content" / f"{kind}.js", const_name, entry)
    print(f"  added '{subject}' → {kind} ({len(saved)} image(s))")
    return True


def main():
    address = os.environ["GMAIL_ADDRESS"]
    password = os.environ["GMAIL_APP_PASSWORD"]
    allowed = [
        a.strip().lower()
        for a in os.environ.get("ALLOWED_SENDERS", "").split(",")
        if a.strip()
    ]

    imap = imaplib.IMAP4_SSL("imap.gmail.com")
    imap.login(address, password)
    imap.select("INBOX")
    # The inbox is a queue: process everything in it (read or unread),
    # then archive it, so peeking at emails in Gmail changes nothing.
    _, data = imap.search(None, "ALL")
    ids = data[0].split()
    print(f"{len(ids)} email(s) waiting in inbox")

    added = 0
    for msg_id in ids:
        _, msg_data = imap.fetch(msg_id, "(RFC822)")
        msg = email.message_from_bytes(msg_data[0][1], policy=email.policy.default)
        sender = email.utils.parseaddr(msg.get("From", ""))[1].lower()
        print(f"from {sender}: {msg.get('Subject', '')}")
        if allowed and sender not in allowed:
            print("  sender not in ALLOWED_SENDERS, archiving unused")
        elif process_message(msg):
            added += 1
        # Archive: with Gmail's default IMAP settings, deleting from INBOX
        # removes the Inbox label; the email stays safe in All Mail.
        imap.store(msg_id, "+FLAGS", "\\Deleted")

    imap.expunge()
    imap.logout()
    print(f"done: {added} entrie(s) added")
    # Signal to the workflow whether anything changed
    if added == 0:
        sys.exit(0)


if __name__ == "__main__":
    main()
