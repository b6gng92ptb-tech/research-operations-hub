# Browser verification — 24 November 2026

## Scope

The standalone `showcase/index.html` exercises a simulated workflow in memory. `scripts/browser-smoke.py` covers creation, submission, reviewer approval, audit count, reset and a mobile-sized viewport. It is separate from the Next.js application and does not call its API, MongoDB or OIDC services.

## Current result

The current React interface and standalone smoke script were not visually verified in a browser. Chromium in the Node test environment could not launch because of a socket permission restriction, and the native desktop browser could not reach the Next.js development server running in the isolated execution environment. The Next.js production build and all automated Node checks passed.

GitHub Pages is not enabled for this repository. The GitHub Actions integration could not create a Pages site with its available permissions, so the expected Pages address returns 404 and is not advertised as a demo.

On a machine where Chromium can access the project and launch:

```bash
CHROMIUM_PATH=/usr/bin/chromium python scripts/browser-smoke.py
```

## Full-stack limits

No live MongoDB replica-set, real OIDC provider, complete login flow, or production deployment was exercised.
