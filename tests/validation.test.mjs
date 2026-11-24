import test from 'node:test';import assert from 'node:assert/strict';
import {requestSchema,canTransition,canPerform} from '../lib/validation.mjs';
test('rejects empty and extraneous fields',()=>{assert.equal(requestSchema.safeParse({title:'bad'}).success,false);assert.equal(requestSchema.safeParse({title:'Research request',description:'Description long enough',category:'research',secret:'x'}).success,false)});
test('accepts valid request',()=>{assert.equal(requestSchema.safeParse({title:'Research request',description:'Description long enough',category:'research'}).success,true)});
test('enforces workflow',()=>{assert.equal(canTransition('submitted','in_review'),true);assert.equal(canTransition('draft','approved'),false)});
test('enforces roles and ownership',()=>{assert.equal(canPerform('requester','read',false),false);assert.equal(canPerform('requester','submit',true),true);assert.equal(canPerform('reviewer','review'),true);assert.equal(canPerform('requester','review'),false)});
