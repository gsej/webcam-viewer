# CLAUDE.md

## What this is

A static webcam viewer — no framework, no build step, no dependencies. Plain HTML, CSS, and a vanilla JS ES module. Deployed to GitHub Pages on push to `master`.

## How it works

- One permission request (a throwaway `getUserMedia` call) unlocks device labels; only then does `enumerateDevices` return named cameras. Browsers hide labels until permission is granted.
- Camera permission persistence is a browser setting, not something the page controls. It requires a secure context (HTTPS or `localhost`) and, in Firefox, "Remember this decision" / padlock → Camera → Allow. A LAN IP over HTTP will re-prompt every time.
- Each added camera is an independent `getUserMedia` stream tracked in a `Map` by a numeric card id; removing a card stops its tracks.
- Layout is flexbox (`flex-wrap` + `justify-content: center`) with fixed-width cards (`--card-width`). Chosen over CSS grid so a lone card on the last row centers, and so +/- steps change card width by an exact amount. Grid's `auto-fit`/`1fr` stretching was deliberately dropped.
- Size controls: S/M/L snap to preset pixel widths; +/- step `--card-width` by 40px (clamped 200–1400). Theme toggles `data-theme` on `<html>`; all colors are CSS custom properties.
- Per-card mirror flips the video with `transform: scaleX(-1)` (display only — would not affect a capture). PiP is suppressed via `video.disablePictureInPicture`.

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
