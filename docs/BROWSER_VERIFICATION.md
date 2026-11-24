# Browser verification — 23 November 2026

## Verified locally

The **standalone HTML showcase** was exercised in headless Chromium via Playwright. The test verified the initial synthetic dataset, creation, requester submission, reviewer start-review and approval, metrics, and absence of JavaScript page errors. Screenshots are in `docs/evidence/` (desktop and mobile viewport). A reproducible smoke test is at `scripts/browser-smoke.py`.

This is **not** proof of Next.js production build, MongoDB transactions, AWS Cognito authentication, CI execution on GitHub, or live deployment. Those remain unverified.

## Repeat

```bash
CHROMIUM_PATH=/usr/bin/chromium python scripts/browser-smoke.py
npm install
npm test
npm run build
```

For backend integration, configure a local MongoDB replica set, create indexes and use a real OIDC test identity; do not expose private tokens in public screenshots. `npm install` and `npm run build` require internet access to npm and were unavailable in the current execution environment.

## Release policy

The standalone showcase can be published as an explicitly labeled **browser-only demonstration**. The Next.js backend should be published as source/architecture evidence only until its build and integration tests have passed. No employer or CMCC data should be used.
