# Change log

## v0.5 — 19 November 2026
- Bounded, validated server-side pagination and optional status filtering for the requests endpoint.
- Requester ownership filtering preserved before database queries; deterministic sorting and total count.
- OIDC hardening: reject explicit non-access token types; require subject claim.
- Unit tests for pagination and query isolation.

### API change
`GET /api/requests` now returns `{items, total, page, pageSize}` rather than a bare array. Any client using the live API must adapt. The local showcase is independent.

### Known gaps
No verified browser build, full OIDC login flow, MongoDB integration test, deployment or transactional audit guarantees. Do not claim production readiness.

## v0.7 — 23 novembre 2026
- PATCH transazionale: richiesta e audit atomici, controllo versione.
- Client MongoDB riutilizzabile per le sessioni.
- Docker Compose predisposto per replica set locale; setup manuale richiesto.
- Correzione indentazione workflow GitHub Actions.
- Roadmap di candidatura aggiornata e guida tecnica alle transazioni.

## v1.1 — 23 November 2026
- Atomic request creation and creation audit in a MongoDB transaction.
- Cache prevention for aggregate metrics.
- Source invariant checker and release gates.
- Explicit, dated release roadmap.
