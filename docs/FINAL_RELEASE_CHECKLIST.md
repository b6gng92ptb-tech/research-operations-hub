# Release verification record — 24 November 2026

## Verified for this source release

- Installed dependencies from the npm registry and generated `package-lock.json`.
- `npm ci --no-audit --no-fund` completed successfully.
- `npm run check:source` passed (20 JavaScript, JSX, and MJS files scanned).
- `npm test` passed all 38 tests (0 failed).
- `npm run build` completed successfully with Next.js 15.5.29; the application page prerendered and API routes compiled.
- The showcase is a separate static browser demo and uses synthetic data only.

## Scope not verified by these checks

- A real MongoDB replica-set deployment, data persistence, transaction behavior under concurrent load, or operational recovery.
- A real OIDC provider, interactive authorization-code/PKCE login, token issuance, rotation, or production identity lifecycle.
- Production deployment of the full-stack Next.js application.
- The standalone showcase's browser behavior, responsive layout, GitHub Pages publication, and public URL must be checked against the actual published deployment before describing them as verified.

Present this project as an independent portfolio prototype. Do not describe it as commissioned by CMCC, a CMCC system, or a production service.
