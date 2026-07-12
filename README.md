# ✨ Samriddhi's Magical World

A private, magical memory book — plain HTML/CSS/JS, no build step, no dependencies. Designed to still work (and still be lovely) decades from now.

## Pages

- **Home** — welcome + navigation cards
- **Artwork** — drawings and paintings, newest first
- **Photos** — family photos and adventures
- **About Me** — one card per birthday, forming a timeline

## Adding a memory

1. Drop the image into `images/artwork/` or `images/photos/`.
2. Open `content/artwork.js` (or `photos.js` / `about.js`) in any text editor.
3. Copy the example entry from the comment at the top of the file, paste it inside the `[ ]`, and edit the title, date, description and tags.
4. Save. Refresh the page — done.

No server, database, or build needed. You can preview by simply double-clicking `index.html`.

## Publishing on GitHub Pages

1. Create a **private** GitHub repository (e.g. `samriddhi-memories`).
2. Upload this whole folder (drag-and-drop on github.com works, or `git push`).
3. In the repo: **Settings → Pages → Source: Deploy from a branch → main → / (root)** → Save.
4. The site appears at `https://<username>.github.io/samriddhi-memories/`.

Note: GitHub Pages on a private repo requires a GitHub Pro/Team plan; on a free plan the repo must be public (the site is still un-indexed — every page has `noindex, nofollow`). For a truly private site on a free plan, consider Cloudflare Pages with access control.

## Adding memories: the inbox folders

Drop image files into the inbox and push — that's the whole workflow:

1. Copy images into `inbox/artwork/` or `inbox/photos/`.
2. `git add -A && git commit -m "new memories" && git push`
3. A GitHub Action files them automatically (usually live within ~2 minutes).

For each image, the **filename becomes the title** (`Rainbow Unicorn.jpg` → "Rainbow Unicorn"), the **date comes from the photo's EXIF** (when it was taken; falls back to today), and the image is auto-rotated, resized to 1600px, and moved to the permanent `images/` folder. The inbox empties itself on success. No secrets, no accounts, no setup.

To add a description or tags afterwards, edit the entry in `content/artwork.js` or `content/photos.js` — each has an example at the top.

Notes: JPG/PNG/HEIC/WebP/GIF are supported. Non-image files are left in the inbox and reported in the Action log. Don't put videos in git (100MB per-file limit).

You can also run the filer locally before pushing: `python3 scripts/file_inbox.py` (needs `pip install pillow pillow-heif`).

## Design notes

- Pastel storybook palette; automatic moon-and-stars night mode (follows system theme).
- Gentle butterflies drift by occasionally; sparkles appear when hovering over cards. Both respect `prefers-reduced-motion`.
- Fonts: Caveat (handwritten headings) + Quicksand (rounded body) from Google Fonts.

## Growing the site later

The structure is ready to add Stories, School, Birthdays, Holidays, Achievements, Timeline and Search as new pages following the same pattern: one HTML page + one `content/*.js` data file.
