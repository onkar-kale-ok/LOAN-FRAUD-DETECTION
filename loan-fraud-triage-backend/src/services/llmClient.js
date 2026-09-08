import axios from 'axios';
import {
  LLM_TIMEOUT_MS,
  LLM_WRAPPER_TOKEN,
  LLM_WRAPPER_URL,
} from '../config/constants.js';
import { llmEvaluationSchema } from '../schemas/llmEvaluationSchema.js';

export class LlmClientError extends Error {
  constructor(message, { status = 502, timedOut = false } = {}) {
    super(message);
    this.name = 'LlmClientError';
    this.status = status;
    this.timedOut = timedOut;
  }
}

/** @deprecated Use LlmClientError */
export class FraudEngineError extends LlmClientError {
  constructor(message, opts) {
    super(message, opts);
    this.name = 'FraudEngineError';
  }
}

/**
 * Contract for wrapper payloads (first match wins):
 * 1. raw string
 * 2. response | reply | content | text | output | result | answer | message (string)
 * 3. choices[0].message.content | choices[0].text
 * 4. data.response | data.reply | data.content | data.text
 */
export function extractAssistantText(payload) {
  if (payload == null) return '';
  if (typeof payload === 'string') return payload.trim();
  if (typeof payload !== 'object') return String(payload);

  const directKeys = [
    'response',
    'reply',
    'content',
    'text',
    'output',
    'result',
    'answer',
    'message',
  ];
  for (const key of directKeys) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (value && typeof value === 'object' && typeof value.text === 'string' && value.text.trim()) {
      return value.text.trim();
    }
  }

  const choice =
    payload.choices?.[0]?.message?.content || payload.choices?.[0]?.text;
  if (typeof choice === 'string' && choice.trim()) return choice.trim();

  const nested = payload.data;
  if (nested && typeof nested === 'object') {
    for (const key of ['response', 'reply', 'content', 'text']) {
      if (typeof nested[key] === 'string' && nested[key].trim()) return nested[key].trim();
    }
  }

  return '';
}

function sliceJsonObject(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return null;
}

function unwrapEvaluationObject(payload) {
  if (!payload || typeof payload !== 'object') return null;
  return (
    payload.evaluationResult ||
    payload.evaluation_result ||
    payload.data?.evaluationResult ||
    payload.data?.evaluation_result ||
    payload
  );
}

function looksLikeScore(object) {
  return (
    object &&
    typeof object === 'object' &&
    (object.riskScore != null || object.risk_score != null)
  );
}

/**
 * Parse wrapper output into the evaluation JSON contract, or throw 502.
 */
export function parseEvaluationResult(payload) {
  let candidate = unwrapEvaluationObject(payload);

  if (!looksLikeScore(candidate)) {
    const text = extractAssistantText(payload) || (typeof payload === 'string' ? payload : '');
    const jsonSlice = sliceJsonObject(text);
    if (!jsonSlice) {
      throw new LlmClientError('LLM response did not contain parseable evaluation JSON');
    }
    try {
      candidate = unwrapEvaluationObject(JSON.parse(jsonSlice));
    } catch {
      throw new LlmClientError('LLM response JSON was malformed');
    }
  }

  const normalized = {
    ...candidate,
    riskScore: candidate.riskScore ?? candidate.risk_score,
    riskTier: candidate.riskTier ?? candidate.risk_tier,
    redFlags: candidate.redFlags ?? candidate.red_flags,
    aiReviewerNote:
      candidate.aiReviewerNote ??
      candidate.ai_reviewer_note ??
      candidate.summary ??
      candidate.rationale,
  };

  const parsed = llmEvaluationSchema.safeParse(normalized);
  if (!parsed.success) {
    throw new LlmClientError('LLM evaluation JSON failed schema validation');
  }

  return parsed.data;
}

export async function queryLlm({ query, prompt, pdfBase64 }) {
  if (!LLM_WRAPPER_TOKEN) {
    throw new LlmClientError('LLM_WRAPPER_TOKEN is not configured', { status: 502 });
  }

  const text = prompt || query;
  if (!text || typeof text !== 'string') {
    throw new LlmClientError('LLM prompt is required', { status: 502 });
  }

  const body = { prompt: text };
  if (typeof pdfBase64 === 'string' && pdfBase64.length > 0) {
    body.pdfBase64 = pdfBase64;
  }

  try {
    const { data } = await axios.post(
      LLM_WRAPPER_URL,
      body,
      {
        headers: {
          Authorization: `Bearer ${LLM_WRAPPER_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: LLM_TIMEOUT_MS,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );
    return data;
  } catch (error) {
    if (error instanceof LlmClientError) throw error;

    const timedOut =
      error.code === 'ECONNABORTED' ||
      error.code === 'ETIMEDOUT' ||
      /timeout/i.test(error.message || '');

    console.error('[queryLlm]', timedOut ? 'timeout' : error.message);

    const providerMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'LLM wrapper request failed';

    throw new LlmClientError(
      timedOut ? `LLM wrapper timed out after ${LLM_TIMEOUT_MS}ms` : providerMessage,
      { status: timedOut ? 504 : 502, timedOut }
    );
  }
}

export default {
  queryLlm,
  extractAssistantText,
  parseEvaluationResult,
  LlmClientError,
  FraudEngineError,
};
