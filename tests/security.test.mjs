import test from 'node:test';
import assert from 'node:assert/strict';
import { validEventId, liveModeEnabled } from '../lib/security.mjs';

test('event identifiers accept bounded opaque IDs', () => {
  assert.equal(validEventId('delivery:2026-001'), true);
  assert.equal(validEventId('request_01234567'), true);
});
test('event identifiers reject injection, whitespace and oversized values', () => {
  for (const value of ['', 'short', 'with space', '<script>alert(1)</script>', 'a'.repeat(101), {}, null]) {
    assert.equal(validEventId(value), false);
  }
});
test('live mode is explicitly opt-in', () => {
  for (const value of [undefined, '', 'TRUE', '1', false]) assert.equal(liveModeEnabled(value), false);
  assert.equal(liveModeEnabled('true'), true);
});
