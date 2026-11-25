import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../showcase/index.html',import.meta.url),'utf8');
test('standalone showcase contains all workflow states',()=>{for(const s of ['draft','submitted','in_review','approved','rejected'])assert.ok(html.includes(s))});
test('showcase discloses simulated roles, fictional data and in-memory behavior',()=>{assert.match(html,/ruoli sono simulati/i);assert.match(html,/informazioni mostrate sono fittizie/i);assert.match(html,/dati restano nella memoria/i);assert.match(html,/non si collega a MongoDB/i)});
test('showcase has explicit audit and role controls',()=>{for(const id of ['id="role"','id="audit-list"','id="request-form"','id="export"'])assert.ok(html.includes(id))});
test('showcase avoids unsafe HTML insertion',()=>{assert.doesNotMatch(html,/innerHTML\s*=/)});
