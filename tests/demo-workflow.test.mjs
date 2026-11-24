import test from 'node:test';
import assert from 'node:assert/strict';
import {applyDemoTransition,createDemoRequest} from '../lib/demo-workflow.mjs';
const original=[{_id:'one',ownerId:'owner',status:'draft',version:1,title:'Example'}];
test('requester can submit own draft and audit is recorded',()=>{
 const r=applyDemoTransition(original,[],{id:'one',to:'submitted',role:'requester',actorId:'owner',at:'2026-01-01T00:00:00Z'});
 assert.equal(r.ok,true);assert.equal(r.rows[0].version,2);assert.equal(r.events[0].from,'draft');assert.equal(original[0].status,'draft');
});
test('requester cannot submit someone else’s draft',()=>{
 const r=applyDemoTransition(original,[],{id:'one',to:'submitted',role:'requester'});
 assert.equal(r.ok,false);assert.equal(r.events.length,0);
});
test('reviewer cannot bypass workflow',()=>{
 const r=applyDemoTransition(original,[],{id:'one',to:'approved',role:'reviewer'});
 assert.equal(r.ok,false);
});
test('creation writes initial audit and rejects duplicate IDs',()=>{
 const r=createDemoRequest(original,[],{title:'Test'},{id:'two'});
 assert.equal(r.ok,true);assert.equal(r.events[0].to,'draft');
 assert.equal(createDemoRequest(r.rows,r.events,{title:'Again'},{id:'two'}).ok,false);
});
