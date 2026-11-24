# Standalone browser showcase

Open `showcase/index.html` directly in a modern browser. It has no npm, server or internet dependency.

## Reviewer walkthrough

1. Create a request as **Requester**. It starts in `draft` and records a synthetic creation event.
2. Submit it, switch to **Reviewer**, start review, then approve or reject it.
3. Inspect the in-memory audit history and export it as JSON.
4. Reset the demonstration to restore the fictional seed data.

## Boundaries

This is a separate, browser-only example that uses simulated roles and in-memory JavaScript state. It demonstrates workflow concepts, not the React interface, OIDC authentication, MongoDB, or API integration. The source of the Next.js application is included separately and its build and automated checks are verified; live service integrations are not.
