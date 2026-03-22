# Personal website

Static single-page academic website.

## Edit content (Markdown-first)
- Keep page layout/header in `index.html`.
- Edit only these Markdown files for content updates:
  - `content/papers.md`
  - `content/teaching.md`
  - `content/policy.md`
- Content is rendered automatically in the browser from Markdown by `scripts/render-markdown.js`.
- Keep page structure and header in `index.template.html`.
- Edit these Markdown files for the main content:
  - `content/papers.md`
  - `content/teaching.md`
  - `content/policy.md`
- Rebuild `index.html` after edits:

```bash
python scripts/build_site.py
```

## Google Analytics setup
- Open `scripts/site-config.js`.
- Set `googleAnalyticsMeasurementId` to your Google Analytics 4 Measurement ID (for example `G-XXXXXXXXXX`).
- Rebuild the site after changing the ID:

```bash
python scripts/build_site.py
```

If the measurement ID is left blank, Google Analytics is not loaded.

## Run locally
```bash
python -m http.server 8000
```
Then open: <http://127.0.0.1:8000/index.html>

## Publish on GitHub Pages (when ready)
- Repo Settings → Pages → Deploy from branch
- Choose branch: `main` and folder: `/ (root)`
