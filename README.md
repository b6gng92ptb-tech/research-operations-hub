# Research Operations Hub

An independent portfolio prototype for research request intake, review workflows, and auditability. It is not commissioned by, affiliated with, or used by CMCC Foundation. All example data is fictional.

## Try the browser-only demo

Open [`showcase/index.html`](showcase/index.html) in a modern browser to try the interactive showcase. It runs entirely in the browser with synthetic in-memory data and a simulated role selector. It does not call the API, persist data, authenticate users, or connect to MongoDB or an OIDC provider. GitHub Pages is not enabled for this repository, so no public demo URL is available.

See [the walkthrough](docs/SHOWCASE_GUIDE.md).

## Full-stack source

The separate Next.js application contains a React dashboard and REST route handlers for requests, audit history, metrics, health, and signed webhooks. It uses MongoDB persistence, Zod validation, and JOSE JWT verification. The source builds, but real MongoDB replica-set transactions and a real OIDC provider have not been integration-tested. There is no authorization-code/PKCE login flow.

### Requirements

- Node.js 22 (Node.js 20.9 or newer is supported)
- npm 10 or newer
- MongoDB replica set for live API operations
- An OIDC provider for live authenticated API operations

### Install and run

```bash
npm ci
npm run check:source
npm test
npm run build
npm run dev
```

Open `http://localhost:3000`. `npm ci` uses the committed `package-lock.json`. To enable live API operations, copy `.env.example` to `.env.local` and configure the issuer, audience, JWKS URL, MongoDB URI, and webhook secret from your own test services. Never commit `.env.local` or real credentials. MongoDB transactions require a replica set; `docker-compose.yml` and `scripts/init-replica.sh` provide a local development setup.

## Architecture and verification

- [Architecture and known limitations](docs/ARCHITECTURE.md)
- [Local deployment notes](docs/DEPLOYMENT.md)
- [Release verification record](docs/FINAL_RELEASE_CHECKLIST.md)
- [Browser demo verification](docs/BROWSER_VERIFICATION.md)
- [Transaction design notes](docs/TRANSACTIONS_IT.md)

GitHub Actions runs the source checks, Node test suite, and production build on pushes and pull requests. The showcase source is included in this repository; it is not a deployment of the full-stack application.
