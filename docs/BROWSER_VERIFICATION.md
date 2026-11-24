# Browser verification — 24 November 2026

## Demo scope

`showcase/index.html` is a standalone static page. The included smoke script exercises demo record creation, requester submission, reviewer approval, audit-event count, reset, and a mobile-sized viewport. It is separate from the Next.js application and makes no API, MongoDB, or OIDC calls.

## Verification status

The scripted browser smoke test could not be run in this execution environment: Chromium is installed, but its process is blocked by the environment's socket permissions. The public GitHub Pages URL also could not be verified because Pages is not enabled for this repository and the available GitHub Actions integration was denied permission to create the Pages site. No public demo URL is claimed.

To run the smoke check on a machine where Chromium can launch:

```bash
CHROMIUM_PATH=/usr/bin/chromium python scripts/browser-smoke.py
```

## Full-stack limits

The Next.js application production build and automated unit/source checks are verified independently. No live MongoDB replica-set, real OIDC provider, complete login flow, or full-stack deployment was exercised.
