import test from 'node:test';
import assert from 'node:assert/strict';
import { filterVisibleRequests, summarizeRequests } from '../lib/workspace-policy.mjs';

const requests = [
  { _id: 'one', ownerId: 'alice', title: 'Water data access', category: 'data', status: 'submitted' },
  { _id: 'two', ownerId: 'bob', title: 'Compute allocation', category: 'infrastructure', status: 'approved' },
];

test('live requesters only see records owned by their authenticated subject', () => {
  const rows = filterVisibleRequests(requests, {
    live: true, role: 'requester', demoRole: 'admin', profileSub: 'alice', search: '',
  });
  assert.deepEqual(rows.map(({ _id }) => _id), ['one']);
});

test('reviewers can search across the visible request queue', () => {
  const rows = filterVisibleRequests(requests, {
    live: false, role: 'requester', demoRole: 'reviewer', profileSub: '', search: '  APPROVED ',
  });
  assert.deepEqual(rows.map(({ _id }) => _id), ['two']);
});

test('request summary counts active and terminal workflow states', () => {
  assert.deepEqual(summarizeRequests(requests), { total: 2, open: 1, approved: 1 });
});
