# CLAUDE.md

## What this is

A static webcam viewer — no framework, no build step, no dependencies. Plain HTML, CSS, and a vanilla JS ES module. Deployed to GitHub Pages on push to `master`.

## Structure

- `index.html` — markup only, references external CSS and JS
- `style.css` — all styles
- `app.js` — ES module; all logic lives here, nothing on `window`
- `.github/workflows/deploy.yml` — deploys the repo root to GitHub Pages on push to `master`

## Running locally

ES modules require a server (browsers block `file://` imports):

```bash
python3 -m http.server
```

## Conventions

- No build tooling — keep it that way unless there's a strong reason to add it
- No globals — all JS state is module-scoped
- Commit messages are prefixed `WIP:` and squashed before merging
