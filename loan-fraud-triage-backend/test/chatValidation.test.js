import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isValidChatMessage } from '../src/utils/chatValidation.js';

describe('isValidChatMessage', () => {
  it('accepts a non-empty string', () => {
    assert.equal(isValidChatMessage('Why is this high risk?'), true);
  });

  it('rejects empty, blank, or non-string values', () => {
    assert.equal(isValidChatMessage(''), false);
    assert.equal(isValidChatMessage('   '), false);
    assert.equal(isValidChatMessage(null), false);
    assert.equal(isValidChatMessage(undefined), false);
    assert.equal(isValidChatMessage(12), false);
  });
});
