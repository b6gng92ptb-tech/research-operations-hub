import test from 'node:test';
import assert from 'node:assert/strict';
import {parsePage,requestFilter} from '../lib/query.mjs';
test('pagination defaults and bounded values',()=>{
 assert.deepEqual(parsePage(new URLSearchParams()),{page:1,pageSize:20,skip:0});
 assert.deepEqual(parsePage(new URLSearchParams('page=3&pageSize=15')),{page:3,pageSize:15,skip:30});
});
test('pagination rejects invalid, oversized and injection-like values',()=>{
 for(const q of ['page=0','page=-1','page=1.5','page=abc','page=10001','pageSize=101','pageSize=0','page=999999999999999999999'])
  assert.throws(()=>parsePage(new URLSearchParams(q)));
});
test('requester sees only own records and filters by status',()=>{
 assert.deepEqual(requestFilter('requester','user-42',null),{ownerId:'user-42'});
 assert.deepEqual(requestFilter('requester','user-42','approved'),{ownerId:'user-42',status:'approved'});
 assert.deepEqual(requestFilter('reviewer','user-42',null),{});
 assert.throws(()=>requestFilter('reviewer','user-42','anything'));
});
