# Standalone showcase — verified scope

Open `showcase/index.html` directly in Chromium, Chrome, Firefox or Safari. No npm, server or internet required.

## Reviewer walkthrough
1. Create a request as **Requester**. It starts in `draft`.
2. Submit it. Switch to **Reviewer** and start review, then approve or reject.
3. Open **View history** to see the event trail; export it to JSON.
4. Reset the demo to restore synthetic seed data.

## Honest boundaries
The standalone showcase uses in-memory JavaScript state and a simulated role selector. It demonstrates workflow logic and UX, **not** React, OIDC, MongoDB or API calls. The separate Next.js project contains React, REST, OIDC verification and MongoDB source code, but needs an actual dependency install, build and database test before claiming those parts run. No external service is contacted by this standalone page.
