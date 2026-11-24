import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):[join(dir,e.name)]);}
const paths=[...walk('app'),...walk('lib')].filter(p=>/\.(js|jsx|mjs)$/.test(p));
const code=Object.fromEntries(paths.map(p=>[p,readFileSync(p,'utf8')]));
assert.match(code['app/api/requests/route.js'],/withTransaction/,'Creation must be transactional');
assert.match(code['app/api/requests/[id]/route.js'],/withTransaction/,'Updates must be transactional');
assert.match(code['app/api/requests/route.js'],/audit_events/,'Creation audit is required');
assert.match(code['app/api/requests/[id]/route.js'],/audit_events/,'Transition audit is required');
assert.ok(code['app/workspace.jsx'].startsWith("'use client';"),'Client component directive must be first');
console.log(`Source invariants passed (${paths.length} JS/JSX/MJS files scanned)`);
