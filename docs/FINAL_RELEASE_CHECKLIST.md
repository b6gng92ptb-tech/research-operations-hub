# Release verification record — 24 November 2026

## Verified in the current revision

- `npm ci --no-audit --no-fund` installed from the committed lockfile.
- `npm run check:source` passed (22 JavaScript, JSX and MJS files scanned).
- `npm test` passed all 46 tests (0 failed), including form validation, unsaved-draft state and role-filtering policy tests.
- `npm run build` completed successfully with Next.js 15.5.29; the page prerendered and all API routes compiled.
- `npm audit --audit-level=high` reported 0 vulnerabilities. PostCSS is pinned through a compatible override at 8.5.33.
- `npm run release:preflight` found the package manifest, lockfile, README and CI workflow.

## Not verified or unavailable

- Browser-based visual and interaction checks could not reach the local Next.js server from the isolated desktop browser. The Chromium process available to the Node test environment is also restricted by socket permissions.
- GitHub Pages is not enabled. The available GitHub Actions token was denied permission to create a Pages site, so no public demo URL is claimed.
- No live MongoDB replica-set transaction test, real OIDC provider, authorization-code/PKCE login, full-stack deployment, or AWS/ERP integration was exercised.

Present this project as an independent portfolio prototype. It was not commissioned by CMCC Foundation and is not a CMCC system or production service.
