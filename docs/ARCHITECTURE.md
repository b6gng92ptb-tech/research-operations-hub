# Architecture and scope

- Next.js App Router server page with an interactive React client dashboard; REST route handlers run in Node.js.
- Shared Zod request validation is applied in the UI and repeated at the API boundary; the UI reports field errors and protects unsaved drafts.
- MongoDB driver, schema validation with Zod, collection indexes and aggregation for status metrics.
- OIDC JWT validation against a remote JWKS, Cognito group-to-role mapping; all real API operations fail closed if auth is not configured.
- Request owner isolation for requester role, reviewers/admin roles for review workflows; optimistic concurrency via `version` and atomic update filters.
- HMAC SHA-256 webhook signature verification with unique `eventId` deduplication index; idempotent storage, not a queue processor.
- Synthetic in-browser showcase deliberately separate from live API. No company data.
- Responsive layout, semantic form labels, visible keyboard focus, table scroll region, reduced-motion support and conflict recovery messaging.

## Known limitations / planned improvements

- No OAuth authorization-code/PKCE login UI; access token is supplied manually for developer evaluation. Do not use this token entry workflow as a public production sign-in.
- MongoDB transactional behavior is covered by source-level/unit contracts but has not been exercised against a live replica set.
- Webhook has signature check but lacks timestamp/replay-window enforcement; event IDs prevent duplicate storage only.
- No end-to-end database tests, a completed browser smoke run in this environment, rate limiting, centralized telemetry, or production deployment.
- Lambda, Cognito infrastructure and n8n are not provisioned.
