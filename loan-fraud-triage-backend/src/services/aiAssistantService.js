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

function formatIncomeGap(declared, ocr) {
  const d = Number(declared);
  const o = Number(ocr);
  if (!Number.isFinite(d) || d <= 0 || !Number.isFinite(o)) return '—';
  const gapPct = Math.round((Math.abs(d - o) / d) * 100);
  return `${gapPct}% (declared vs OCR bank income)`;
}

function formatYesNo(value) {
  if (value === true || value === 'true') return 'Yes';
  if (value === false || value === 'false') return 'No';
  return '—';
}

export function buildAssistantPrompt(record, userMessage) {
  const payload = record.payload || record;
  const applicant = payload.applicant || {};
  const financials = payload.financials || {};
  const telemetry = payload.telemetry || {};
  const documentOcr = payload.documentOcr || record.documentOcr || {};
  const evaluationResult = record.evaluationResult || {};

  const aiSummary =
    evaluationResult.aiReviewerSummary ||
    evaluationResult.aiReviewerNote ||
    record.aiReviewerNote ||
    '—';

  const redFlags = evaluationResult.redFlags || record.redFlags || [];
  const incomeGap = formatIncomeGap(financials.declaredIncome, financials.ocrBankIncome);

  return [
    'You are an underwriter copilot for ONE stored loan application.',
    'Answer only from the Application Context below. If something is missing, say so. Do not invent PAN, income, device IDs, or scores.',
    'Reply in concise professional prose (short bullets allowed). Do not return the evaluation JSON object (no riskScore/riskTier payload).',
    'If the user asks for a graph or network, describe shared device/phone/address/employer links from Corpus signals. The dashboard also has a Network tab.',
    '',
    'Answer format:',
    '- Lead with a direct answer in 1-2 sentences.',
    '- Use bullets only when listing flags or anomalies.',
    '- When citing facts, reference field names (e.g. declaredIncome, deviceReuseCount).',
    '- Max ~200 words unless drafting a formal letter.',
    '',
    'Application Context:',
    `- Application ID: ${record.applicationId || '—'}`,
    `- Applicant Name: ${applicant.name || '—'}`,
    `- Company Name: ${applicant.companyName || '—'}`,
    `- PAN: ${applicant.panNumber || '—'}`,
    `- Phone: ${applicant.phone || '—'}`,
    `- Email: ${applicant.email || '—'}`,
    `- Declared Income: ${formatInr(financials.declaredIncome)}`,
    `- OCR Bank Income: ${formatInr(financials.ocrBankIncome)}`,
    `- Income Gap: ${incomeGap}`,
    `- Employment Type: ${applicant.employmentType || '—'}`,
    `- Declared Address: ${applicant.address || '—'}`,
    `- OCR Address: ${documentOcr.ocrExtractedAddress || '—'}`,
    `- Address Match (form): ${documentOcr.addressMatchScore ?? '—'}%`,
    `- Address Match (computed overlap): ${documentOcr.computedAddressMatch ?? '—'}%`,
    `- Bank Statement Summary: ${financials.bankStatementSummary || '—'}`,
    `- Application Timestamp: ${telemetry.applicationTimestamp || record.applicationTimestamp || '—'}`,
    `- Document Tampering Flagged: ${formatYesNo(documentOcr.documentTamperFlag)}`,
    `- Device ID: ${telemetry.deviceId || '—'} (Reuse Count: ${telemetry.deviceReuseCount ?? '—'})`,
    `- IP Address: ${telemetry.ipAddress || '—'}`,
    `- IP Location: ${telemetry.ipLocation || '—'}`,
    `- Risk Tier: ${evaluationResult.riskTier || record.riskTier || '—'}`,
    `- Risk Score: ${evaluationResult.riskScore ?? record.riskScore ?? '—'}/100`,
    `- AI Summary: ${aiSummary}`,
    `- Corpus / duplicates: device ${JSON.stringify(record.corpusSignals?.deviceMatches || [])}; phone ${JSON.stringify(record.corpusSignals?.phoneMatches || [])}; email ${JSON.stringify(record.corpusSignals?.emailMatches || [])}`,
    '',
    `Underwriter Question: ${userMessage}`,
  ].join('\n');
}

export async function askAssistant(record, userMessage) {
  const prompt = buildAssistantPrompt(record, userMessage);
  const data = await queryLlm({ prompt });

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
