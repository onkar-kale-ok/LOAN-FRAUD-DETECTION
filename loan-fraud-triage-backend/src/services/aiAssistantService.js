import { LlmClientError, extractAssistantText, queryLlm } from './llmClient.js';

function formatInr(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value ?? '—');
  return `₹${n.toLocaleString('en-IN')}`;
}

function formatRedFlags(flags) {
  if (!Array.isArray(flags) || flags.length === 0) return 'None';
  return flags
    .map((flag) => {
      if (typeof flag === 'string') return flag;
      const label = flag.label || flag.code || 'Flag';
      const evidence = flag.evidence ? `: ${flag.evidence}` : '';
      return `${label}${evidence}`;
    })
    .join('; ');
}

export function buildAssistantPrompt(record, userMessage) {
  const payload = record.payload || record;
  const applicant = payload.applicant || {};
  const financials = payload.financials || {};
  const telemetry = payload.telemetry || {};
  const evaluationResult = record.evaluationResult || {};

  const aiSummary =
    evaluationResult.aiReviewerSummary ||
    evaluationResult.aiReviewerNote ||
    record.aiReviewerNote ||
    '—';

  const redFlags = evaluationResult.redFlags || record.redFlags || [];

  return [
    'Application Context:',
    `- Application ID: ${record.applicationId || '—'}`,
    `- Applicant Name: ${applicant.name || '—'}`,
    `- Company Name: ${applicant.companyName || '—'}`,
    `- Declared Income: ${formatInr(financials.declaredIncome)}`,
    `- OCR Bank Income: ${formatInr(financials.ocrBankIncome)}`,
    `- Device ID: ${telemetry.deviceId || '—'} (Reuse Count: ${telemetry.deviceReuseCount ?? '—'})`,
    `- IP Location: ${telemetry.ipLocation || '—'}`,
    `- Risk Tier: ${evaluationResult.riskTier || record.riskTier || '—'}`,
    `- Risk Score: ${evaluationResult.riskScore ?? record.riskScore ?? '—'}/100`,
    `- AI Summary: ${aiSummary}`,
    `- Active Red Flags: ${formatRedFlags(redFlags)}`,
    '',
    `Underwriter Question: ${userMessage}`,
  ].join('\n');
}

export async function askAssistant(record, userMessage) {
  const query = buildAssistantPrompt(record, userMessage);
  const data = await queryLlm({
    query,
    applicationId: record.applicationId,
  });

  const reply = extractAssistantText(data);
  if (!reply) {
    throw new LlmClientError('LLM returned an empty assistant reply');
  }
  return reply;
}

export async function getChatHistory(record) {
  return Array.isArray(record?.chatHistory) ? record.chatHistory : [];
}

export default { askAssistant, getChatHistory, buildAssistantPrompt };
