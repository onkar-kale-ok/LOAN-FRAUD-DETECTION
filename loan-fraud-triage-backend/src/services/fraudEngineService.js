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
    'You are a loan-fraud risk engine for a single Indian MSME/personal loan application.',
    '',
    'Return ONLY one JSON object. No markdown, no code fences, no prose before or after the JSON.',
    'Use these exact camelCase keys and no others:',
    '',
    '{',
    '  "riskScore": 0,',
    '  "riskTier": "LOW",',
    '  "redFlags": [',
    '    { "code": "INCOME_MISMATCH", "label": "Income mismatch", "evidence": "Fact from this application only" }',
    '  ],',
    '  "aiReviewerNote": "2-4 sentences for an underwriter."',
    '}',
    '',
    'Rules:',
    '- riskScore: integer 0-100.',
    '- riskTier: exactly one of LOW, MEDIUM, HIGH.',
    '  Use HIGH if score >= 75, MEDIUM if score >= 40, otherwise LOW.',
    '- redFlags: array. Use [] if none. Each item must have string fields code, label, evidence.',
    '  If no fraud signals apply, return "redFlags": [] — do not invent flags.',
    '  Prefer codes: INCOME_MISMATCH, DEVICE_REUSE, DOCUMENT_TAMPER, ADDRESS_MISMATCH, VPN_OR_PROXY, IP_LOCATION_RISK.',
    '- aiReviewerNote: string, not an object.',
    '- Score only the JSON under "Application". Do not reuse other cases.',
    '- Compare declaredIncome vs ocrBankIncome, deviceReuseCount, documentTamperFlag, addressMatchScore, ipLocation.',
    '- ocrBankIncome and documentOcr are form/scenario values, not live OCR of the PDF.',
    '',
    'Scoring guide (approximate; cap riskScore at 100; riskTier must match score bands above):',
    '- Large income gap (>40%): +25 to +40 points',
    '- deviceReuseCount >= 3: +15 to +25 points',
    '- documentTamperFlag true: +20 to +30 points',
    '- addressMatchScore < 50: +10 to +20 points',
    '- VPN/proxy indicated in ipLocation: +10 to +15 points',
    hasPdf
      ? '- A bank-statement PDF is attached as pdfBase64; use it only as supporting bank-statement evidence. If it conflicts with form OCR fields, mention that in evidence and in aiReviewerNote.'
      : '',
    '',
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

  const prompt = buildQuery(inputData, Boolean(pdfBase64));
  const data = await queryLlm({
    prompt,
    ...(pdfBase64 ? { pdfBase64 } : {}),
  });

  return normalizeEngineResult(parseEvaluationResult(data));
}

export async function runFraudEvaluation(payload, pdfBuffer) {
  return runFraudEngine(payload, pdfBuffer);
}

export default { runFraudEngine, runFraudEvaluation, LlmClientError };
