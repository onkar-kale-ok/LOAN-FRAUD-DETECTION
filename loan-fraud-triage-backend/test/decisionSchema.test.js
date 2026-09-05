import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DECISION_STATUSES, decisionBodySchema } from '../src/schemas/decisionSchema.js';

describe('decisionBodySchema', () => {
  for (const status of DECISION_STATUSES) {
    it(`accepts ${status}`, () => {
      const result = decisionBodySchema.safeParse({
        decisionStatus: status,
        reviewerNotes: 'ok',
      });
      assert.equal(result.success, true);
      assert.equal(result.data.decisionStatus, status);
    });
  }

  it('defaults reviewerNotes to an empty string', () => {
    const result = decisionBodySchema.safeParse({ decisionStatus: 'APPROVED' });
    assert.equal(result.success, true);
    assert.equal(result.data.reviewerNotes, '');
  });

  it('rejects an unknown decisionStatus', () => {
    const result = decisionBodySchema.safeParse({
      decisionStatus: 'CLEARED',
      reviewerNotes: 'nope',
    });
    assert.equal(result.success, false);
  });

  it('rejects a missing decisionStatus', () => {
    const result = decisionBodySchema.safeParse({ reviewerNotes: 'x' });
    assert.equal(result.success, false);
  });
});
