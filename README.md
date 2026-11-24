# Research Operations Hub

Independent portfolio prototype for research request workflows. Not affiliated with CMCC. No employer source code or real operational data.

## Current repository status
Publication in progress: the workflow policy and its unit tests are available. The complete Next.js application and standalone showcase are not yet uploaded.

## Run the published tests
Requires Node.js 20 or newer.
```bash
node --test tests/workflow.test.mjs
```

The workflow separates state transitions and role-based permissions from persistence and HTTP. Requesters submit their own drafts; reviewers review submitted requests; terminal states cannot be reopened.

The complete local prototype uses Next.js, React, Node.js, MongoDB, Zod and JWT validation. Live database and identity-provider integration have not been verified. This is not production software.
