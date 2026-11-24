import test from 'node:test';
import assert from 'node:assert/strict';
import {STATES,canTransition,canPerform,authorizeTransition} from '../lib/workflow.mjs';
test('workflow permits only defined edges',()=>{
 assert.deepEqual(STATES,['draft','submitted','in_review','approved','rejected']);
 for(const from of STATES)for(const to of STATES){
  const expected=({draft:['submitted'],submitted:['in_review'],in_review:['approved','rejected'],approved:[],rejected:[]}[from]).includes(to);
  assert.equal(canTransition(from,to),expected,`${from} -> ${to}`);
 }
});
test('requester can submit own draft but cannot approve',()=>{
 assert.deepEqual(authorizeTransition({role:'requester',ownerId:'a',actorId:'a',from:'draft',to:'submitted'}),{ok:true});
 assert.equal(authorizeTransition({role:'requester',ownerId:'a',actorId:'b',from:'draft',to:'submitted'}).reason,'forbidden');
 assert.equal(authorizeTransition({role:'requester',ownerId:'a',actorId:'a',from:'in_review',to:'approved'}).reason,'forbidden');
});
test('reviewer can review but cannot create or submit',()=>{
 assert.equal(canPerform('reviewer','create'),false);
 assert.equal(authorizeTransition({role:'reviewer',ownerId:'a',actorId:'b',from:'submitted',to:'in_review'}).ok,true);
 assert.equal(authorizeTransition({role:'reviewer',ownerId:'a',actorId:'b',from:'draft',to:'submitted'}).reason,'forbidden');
});
test('unknown role is denied and terminal states cannot move',()=>{
 assert.equal(canPerform('guest','read',true),false);
 assert.equal(authorizeTransition({role:'admin',ownerId:'a',actorId:'a',from:'approved',to:'draft'}).reason,'invalid_transition');
});
