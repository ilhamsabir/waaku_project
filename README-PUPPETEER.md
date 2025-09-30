Puppeteer Runtime Modes
=======================

This project runs Puppeteer (Chromium) inside Docker (linux) by default, and can also run on macOS natively.

Environment variables:

- WAAKU_RUNTIME: linux (default) | mac
  - linux: uses /usr/bin/chromium-browser in container and Docker-friendly flags
  - mac: lets Puppeteer resolve Chromium automatically. You can optionally set WAAKU_CHROME_PATH

- WAAKU_CHROME_PATH: optional absolute path to Chrome/Chromium when WAAKU_RUNTIME=mac

Examples
--------

Run on macOS locally (no Docker):

    export WAAKU_RUNTIME=mac
    # optional if you want to force a path
    # export WAAKU_CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    npm run dev

Run in Docker (default):

  # For Docker, WAAKU_RUNTIME=linux (see docker-compose.yml)
  npm run dev
