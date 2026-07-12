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

## Design notes

- Pastel storybook palette; automatic moon-and-stars night mode (follows system theme).
- Gentle butterflies drift by occasionally; sparkles appear when hovering over cards. Both respect `prefers-reduced-motion`.
- Fonts: Caveat (handwritten headings) + Quicksand (rounded body) from Google Fonts.

## Growing the site later

The structure is ready to add Stories, School, Birthdays, Holidays, Achievements, Timeline and Search as new pages following the same pattern: one HTML page + one `content/*.js` data file.
