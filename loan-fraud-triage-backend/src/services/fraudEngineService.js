import { LlmClientError, queryLlm, parseEvaluationResult } from './llmClient.js';

export { LlmClientError, FraudEngineError } from './llmClient.js';

function clampScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function tierFromScore(riskScore) {
  if (riskScore >= 75) return 'HIGH';
  if (riskScore >= 40) return 'MEDIUM';
  return 'LOW';
}

function statusFromTier(riskTier) {
  if (riskTier === 'HIGH') return 'FLAGGED';
  if (riskTier === 'MEDIUM') return 'UNDER_REVIEW';
  return 'CLEARED';
}

function buildQuery(inputData, hasPdf) {
  return [
    'You are a loan-fraud risk engine. Analyze the application JSON.',
    'Return ONLY valid JSON with keys: riskScore (0-100 number), riskTier (LOW|MEDIUM|HIGH),',
    'redFlags (array of {code,label,evidence}), aiReviewerNote (string).',
    hasPdf ? 'A bank-statement PDF is attached as pdfBase64; use it as supporting evidence.' : '',
    'Score only this application. Do not reuse prior cases.',
    'Application:',
    JSON.stringify(inputData),
  ]
    .filter(Boolean)
    .join('\n');
}

function normalizeEngineResult(parsed) {
  const riskScore = clampScore(parsed.riskScore);
  if (riskScore == null) {
    throw new LlmClientError('LLM response did not include a numeric riskScore');
  }

  const riskTier = ['LOW', 'MEDIUM', 'HIGH'].includes(String(parsed.riskTier || ''))
    ? parsed.riskTier
    : tierFromScore(riskScore);

  return {
    riskScore,
    riskTier,
    status: statusFromTier(riskTier),
    redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
    aiReviewerNote: typeof parsed.aiReviewerNote === 'string' ? parsed.aiReviewerNote : '',
    source: 'llm',
  };
}

export async function runFraudEngine(inputData, pdfBuffer) {
  const pdfBase64 =
    Buffer.isBuffer(pdfBuffer) && pdfBuffer.length > 0
      ? pdfBuffer.toString('base64')
      : undefined;

  const query = buildQuery(inputData, Boolean(pdfBase64));
  const data = await queryLlm({
    query,
    inputData,
    ...(pdfBase64 ? { pdfBase64 } : {}),
  });

  return normalizeEngineResult(parseEvaluationResult(data));
}

export async function runFraudEvaluation(payload, pdfBuffer) {
  return runFraudEngine(payload, pdfBuffer);
}

export default { runFraudEngine, runFraudEvaluation, LlmClientError };
