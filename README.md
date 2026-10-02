# Webcam Viewer

A simple, ad-free static web page for testing webcams. Select a camera, grant browser permission, and see the live preview.

## Features

- Lists all available video input devices by name
- Live preview via the browser MediaDevices API
- No server, no build step, no dependencies

## Usage

Open `index.html` via a local server (required for ES modules) or visit the GitHub Pages URL.

```bash
python3 -m http.server
```

## Deployment

Pushes to `master` deploy automatically to GitHub Pages via the workflow in `.github/workflows/deploy.yml`.
