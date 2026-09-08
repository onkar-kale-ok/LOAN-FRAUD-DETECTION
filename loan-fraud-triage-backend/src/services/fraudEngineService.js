import { LlmClientError, queryLlm, parseEvaluationResult } from './llmClient.js';
import { computeAddressMatchScore } from '../utils/addressMatch.js';
import {
  applyBlockPromotion,
  normalizeRiskTier,
  statusFromTier,
  tierFromScore,
} from '../utils/riskBands.js';

export { LlmClientError, FraudEngineError } from './llmClient.js';

function clampScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function formatCrossApp(crossApp = {}) {
  const line = (label, ids) =>
    `${label}: ${ids?.length ? ids.join(', ') : 'none'}`;
  return [
    `Computed device reuse (this filing + prior matches): ${crossApp.computedDeviceReuseCount ?? 1}`,
    `Form-reported device reuse: ${crossApp.reportedDeviceReuseCount ?? 0}`,
    line('Prior apps with same deviceId', crossApp.deviceMatches),
    line('Prior apps with same phone', crossApp.phoneMatches),
    line('Prior apps with same email', crossApp.emailMatches),
    line('Prior apps with same declared address', crossApp.addressMatches),
    line('Prior apps with same employer', crossApp.employerMatches),
  ].join('\n');
}

function buildQuery(inputData, { hasPdf, crossApp, salary, computedAddressMatch }) {
  return [
    'You are a loan-fraud risk engine for a single Indian MSME/personal loan application.',
    'Treat all findings as suspicion for investigators, not confirmed fraud. Use neutral language.',
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
    '  "aiReviewerNote": "2-4 sentences for an underwriter. Factual and neutral."',
    '}',
    '',
    'Rules:',
    '- riskScore: integer 0-100.',
    '- riskTier: exactly one of LOW, MEDIUM, HIGH, BLOCK.',
    '  LOW if score < 40, MEDIUM if score >= 40, HIGH if score >= 75, BLOCK if score >= 90.',
    '  BLOCK means Block/Review: severe multi-signal suspicion (ring, duplicates, tamper) — still not confirmed fraud.',
    '- redFlags: array. Use [] if none. Each item must have string fields code, label, evidence.',
    '  If no fraud signals apply, return "redFlags": [] — do not invent flags.',
    '  Prefer codes: INCOME_MISMATCH, HIGH_SALARY_VS_ROLE, DEVICE_REUSE, DUPLICATE_PHONE, DUPLICATE_EMAIL,',
    '  DOCUMENT_TAMPER, ADDRESS_MISMATCH, VPN_OR_PROXY, IP_LOCATION_RISK.',
    '- aiReviewerNote: string, not an object. Separate suspicion from confirmed fraud.',
    '- Score only the JSON under Application plus Corpus signals. Do not reuse other cases except those listed in Corpus signals.',
    '- Compare declared address vs OCR address (not the match % alone). The computed token-overlap score is a helper.',
    '- Use bankStatementSummary as the structured statement narrative. ocrBankIncome is a form/scenario OCR figure, not live OCR of a PDF.',
    '- Unusually high declared salary vs employmentType/employer: use HIGH_SALARY_VS_ROLE when the salary heuristic is flagged.',
    '- Duplicate phone/email/device: cite the matching application IDs from Corpus signals.',
    '',
    'Scoring guide (approximate; cap riskScore at 100; riskTier must match score bands above):',
    '- Large income gap (>40%): +25 to +40 points',
    '- Computed deviceReuseCount >= 3: +15 to +25 points',
    '- Duplicate phone or email on prior apps: +15 to +25 points',
    '- Unusually high salary vs role: +10 to +20 points',
    '- documentTamperFlag true: +20 to +30 points',
    '- Declared vs OCR address overlap < 50: +10 to +20 points',
    '- VPN/proxy indicated in ipLocation: +10 to +15 points',
    hasPdf
      ? '- A bank-statement PDF is attached as pdfBase64; use it only as supporting bank-statement evidence. If it conflicts with bankStatementSummary or OCR income, mention that in evidence and in aiReviewerNote.'
      : '',
    '',
    'Application:',
    JSON.stringify(inputData),
    '',
    `Computed address overlap (declared vs OCR): ${computedAddressMatch}%`,
    '',
    'Salary vs role heuristic:',
    JSON.stringify(salary),
    '',
    'Corpus signals (from stored evaluations, not the form reuse count):',
    formatCrossApp(crossApp),
  ]
    .filter(Boolean)
    .join('\n');
}

function normalizeEngineResult(parsed, crossApp, salary) {
  const riskScore = clampScore(parsed.riskScore);
  if (riskScore == null) {
    throw new LlmClientError('LLM response did not include a numeric riskScore');
  }

  let riskTier = normalizeRiskTier(parsed.riskTier, riskScore);
  if (!parsed.riskTier) {
    riskTier = tierFromScore(riskScore);
  }
  riskTier = applyBlockPromotion(riskTier, riskScore, crossApp, salary);

  return {
    riskScore,
    riskTier,
    status: statusFromTier(riskTier),
    redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
    aiReviewerNote: typeof parsed.aiReviewerNote === 'string' ? parsed.aiReviewerNote : '',
    source: 'llm',
  };
}

export async function runFraudEngine(inputData, pdfBuffer, { crossApp, salary } = {}) {
  const pdfBase64 =
    Buffer.isBuffer(pdfBuffer) && pdfBuffer.length > 0
      ? pdfBuffer.toString('base64')
      : undefined;

  const computedAddressMatch = computeAddressMatchScore(
    inputData?.applicant?.address,
    inputData?.documentOcr?.ocrExtractedAddress
  );

  const prompt = buildQuery(inputData, {
    hasPdf: Boolean(pdfBase64),
    crossApp,
    salary,
    computedAddressMatch,
  });
  const data = await queryLlm({
    prompt,
    ...(pdfBase64 ? { pdfBase64 } : {}),
  });

  return normalizeEngineResult(parseEvaluationResult(data), crossApp, salary);
}

export async function runFraudEvaluation(payload, pdfBuffer, extras) {
  return runFraudEngine(payload, pdfBuffer, extras);
}

export default { runFraudEngine, runFraudEvaluation, LlmClientError };
