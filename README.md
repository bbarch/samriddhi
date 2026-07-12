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

## Adding memories by email

Send an email to the dedicated Gmail account and the site updates itself within ~15 minutes:

- **Subject** → title. Start it with `art:` to file under Artwork (e.g. `art: Rainbow Unicorn`); otherwise it goes to Photos.
- **Body** → description. A line like `Tags: Unicorn, Drawing` becomes tags.
- **Attachments** → images (JPG/PNG/HEIC), auto-rotated, resized to 1600px, published.

Only senders listed in the `ALLOWED_SENDERS` secret can post — everything else is ignored.

### One-time setup

1. Create a dedicated Gmail account (e.g. `samriddhi.memories@gmail.com`).
2. Turn on 2-Step Verification, then create an **App password**: myaccount.google.com → Security → 2-Step Verification → App passwords.
3. In the GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**, add:
   - `GMAIL_ADDRESS` — the Gmail address
   - `GMAIL_APP_PASSWORD` — the 16-character app password
   - `ALLOWED_SENDERS` — comma-separated emails allowed to post (e.g. `ab@bbarch.net`)
4. Push this repo. The workflow in `.github/workflows/email-import.yml` runs every 15 minutes (or trigger it manually from the **Actions** tab).

## Design notes

- Pastel storybook palette; automatic moon-and-stars night mode (follows system theme).
- Gentle butterflies drift by occasionally; sparkles appear when hovering over cards. Both respect `prefers-reduced-motion`.
- Fonts: Caveat (handwritten headings) + Quicksand (rounded body) from Google Fonts.

## Growing the site later

The structure is ready to add Stories, School, Birthdays, Holidays, Achievements, Timeline and Search as new pages following the same pattern: one HTML page + one `content/*.js` data file.
