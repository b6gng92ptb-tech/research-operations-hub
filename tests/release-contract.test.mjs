import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('CI requires a reproducible dependency lock',()=>assert.match(source('.github/workflows/ci.yml'),/npm ci/));
test('requester live visibility is restricted to owner',()=>assert.match(source('app/workspace.jsx'),/role!=='requester'\|\|x\.ownerId===profileSub/));
test('server verifies access tokens instead of trusting demo role',()=>assert.match(source('lib/auth.js'),/jwtVerify/));
test('updates use transactional audit writes',()=>{const code=source('app/api/requests/[id]/route.js');assert.match(code,/withTransaction/);assert.match(code,/audit_events/)});
