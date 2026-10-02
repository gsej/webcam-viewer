# Webcam Viewer

A simple, ad-free static web page for testing webcams. Grant browser permission, then add one or more cameras and view their live output side by side.

## Features

- Lists all available video input devices by name
- Add multiple cameras at once, each in its own live view; remove any individually
- Fluid layout that flows across the screen and wraps on narrow displays
- Resize the views with S/M/L presets or fine +/- steps
- Light and dark themes
- Per-camera horizontal mirror
- No server, no build step, no dependencies

## Usage

Serve the files locally (a server is required — browsers block ES module imports over `file://`) or visit the GitHub Pages URL:

```bash
python3 -m http.server
```

Then open `http://localhost:8000`.

Note: the browser remembers camera permission only on a secure context (HTTPS or `localhost`). Served from a LAN IP over HTTP, it will prompt on every refresh.

## Deployment

Pushes to `master` deploy automatically to GitHub Pages via the workflow in `.github/workflows/deploy.yml`.
