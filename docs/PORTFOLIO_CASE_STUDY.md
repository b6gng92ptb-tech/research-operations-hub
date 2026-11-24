# Research Operations Hub — technical case study

## Overview

An independent full-stack prototype for routing internal requests through a controlled review lifecycle. The data is fictional; the project was not commissioned by, affiliated with, or used by any employer or research institution.

The workflow covers request creation, submission, review, approval or rejection, and an audit trail. The standalone HTML showcase is intentionally separate from the Next.js application and uses simulated roles and in-memory state.

## Engineering decisions

- **Validated intake:** the React form and Node.js API share one strict Zod schema. Field errors are shown in the UI, and a browser navigation warning protects a partially completed draft.
- **Server-side authorization:** the API verifies signed OIDC access tokens with JOSE, maps claims to roles, and scopes requester reads to the authenticated subject. Demo role selection never grants API access.
- **Concurrent updates:** each request carries a version number. Updates check the current version and workflow edge; state and audit writes run in one MongoDB transaction.
- **Bounded inputs:** request bodies and pagination are size-limited and validated before database use. Query filters use allow-listed fields and values.
- **Signed events:** the webhook route verifies an HMAC signature and uses event IDs for idempotent insertion. It is not a queue or a production webhook platform.
- **Quality gates:** Node.js unit and source-contract tests run in GitHub Actions alongside `npm ci` and a Next.js production build.

## Evidence and limits

| Area | Evidence in this repository | Verification boundary |
|---|---|---|
| React and Next.js | App Router page, interactive dashboard, shared-schema form validation, draft protection, responsive layout | Production build passes; browser interaction and visual review remain outstanding |
| Node.js and REST | Request, audit, health, metrics and webhook route handlers | Source tests cover rules and input policies; routes have not been exercised against live services |
| MongoDB | Collection/index setup, aggregation, ownership filters, optimistic concurrency and transactional audit writes | No live replica-set integration test or operational backup/restore run |
| OIDC and authorization | JWT signature, issuer/audience checks and role policy | No real provider, interactive OAuth2/PKCE login, or user lifecycle |
| CI/CD | GitHub Actions runs reproducible install, source checks, tests and production build | Full-stack hosting, PM2, DNS, Nginx, HTTPS and AWS are documented areas, not deployed services |
| System integrations | HMAC-protected webhook endpoint and event deduplication | No ERP, automation platform, external event source or replay-window deployment |

## Run locally

Use Node.js 22 and run `npm ci`, `npm run check`, and `npm run dev`. The standalone showcase can be opened directly from `showcase/index.html`. See [the architecture notes](ARCHITECTURE.md), [release verification record](FINAL_RELEASE_CHECKLIST.md), and [showcase walkthrough](SHOWCASE_GUIDE.md).
