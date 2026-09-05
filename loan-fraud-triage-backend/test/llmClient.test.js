import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import {
  extractAssistantText,
  parseEvaluationResult,
} from '../src/services/llmClient.js';

const fixtures = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'llm');

function load(name) {
  return JSON.parse(readFileSync(path.join(fixtures, name), 'utf8'));
}

describe('extractAssistantText', () => {
  it('reads wrapper.response for chat replies', () => {
    const text = extractAssistantText(load('chat-response.json'));
    assert.match(text, /Device reuse is elevated/);
  });

  it('reads OpenAI-style choices[0].message.content', () => {
    const text = extractAssistantText(load('eval-openai-snake.json'));
    assert.match(text, /risk_score/);
  });

  it('returns empty when no contract field is present', () => {
    assert.equal(extractAssistantText(load('eval-invalid.json')), '');
  });
});

describe('parseEvaluationResult', () => {
  it('parses a plain evaluation object', () => {
    const result = parseEvaluationResult(load('eval-plain.json'));
    assert.equal(result.riskScore, 88);
    assert.equal(result.riskTier, 'HIGH');
    assert.equal(result.redFlags.length, 1);
    assert.match(result.aiReviewerNote, /decline/i);
  });

  it('parses fenced JSON inside response', () => {
    const result = parseEvaluationResult(load('eval-fenced-response.json'));
    assert.equal(result.riskScore, 42);
    assert.equal(result.riskTier, 'MEDIUM');
  });

  it('parses snake_case JSON from chat-completions shape', () => {
    const result = parseEvaluationResult(load('eval-openai-snake.json'));
    assert.equal(result.riskScore, 12);
    assert.equal(result.riskTier, 'LOW');
    assert.match(result.aiReviewerNote, /Clean/);
  });

  it('throws 502 when the payload is not evaluation JSON', () => {
    assert.throws(
      () => parseEvaluationResult(load('eval-invalid.json')),
      (error) => error.status === 502 && /parseable evaluation JSON/i.test(error.message)
    );
  });
});
