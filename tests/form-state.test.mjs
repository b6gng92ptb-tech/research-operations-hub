import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyRequestDraft, hasUnsavedRequestDraft, validateRequestDraft } from '../lib/form-state.mjs';

test('blank request form starts clean and edits are detected', () => {
  assert.equal(hasUnsavedRequestDraft(emptyRequestDraft), false);
  assert.equal(hasUnsavedRequestDraft({ ...emptyRequestDraft, title: 'Draft request' }), true);
});

test('request validation returns normalized data from the shared API schema', () => {
  const result = validateRequestDraft({
    title: '  Data access request  ',
    description: '  Need access for the scheduled analysis.  ',
    category: 'data',
    priority: 'high',
  });
  assert.equal(result.success, true);
  assert.equal(result.data.title, 'Data access request');
  assert.equal(result.data.description, 'Need access for the scheduled analysis.');
});

test('request validation gives field errors and rejects unknown properties', () => {
  const result = validateRequestDraft({ ...emptyRequestDraft, title: 'bad', unexpected: true });
  assert.equal(result.success, false);
  assert.ok(result.fieldErrors.title);
});

test('request validation rejects an unsupported category', () => {
  const result = validateRequestDraft({
    title: 'Valid request title',
    description: 'A description long enough for validation.',
    category: 'other',
    priority: 'medium',
  });
  assert.equal(result.success, false);
  assert.ok(result.fieldErrors.category);
});
