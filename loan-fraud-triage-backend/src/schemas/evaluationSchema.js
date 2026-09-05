import { z } from 'zod';

const nonempty = z.string().trim().min(1, 'Required');

const booleanFlag = z.preprocess((value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off', ''].includes(normalized)) return false;
  }
  return value;
}, z.boolean());

export const evaluationSchema = z.object({
  applicant: z.object({
    name: nonempty,
    companyName: nonempty,
    panNumber: nonempty,
    phone: nonempty,
    email: z.string().trim().email('Invalid email'),
  }),
  financials: z.object({
    declaredIncome: z.coerce.number().finite().nonnegative(),
    ocrBankIncome: z.coerce.number().finite().nonnegative(),
  }),
  telemetry: z.object({
    deviceId: nonempty,
    ipAddress: nonempty,
    ipLocation: nonempty,
    deviceReuseCount: z.coerce.number().int().nonnegative(),
  }),
  documentOcr: z.object({
    addressMatchScore: z.coerce.number().min(0).max(100),
    documentTamperFlag: booleanFlag,
    uploadedBankStatement: z.string().optional(),
  }),
});

function parseMaybeJson(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }
  return value;
}

/**
 * Accepts JSON, multipart nested JSON strings, a `payload` wrapper, or a flat form.
 */
export function parseEvaluatePayload(body = {}) {
  let source = body ?? {};

  if (typeof source.payload === 'string' || (source.payload && typeof source.payload === 'object')) {
    const nested = parseMaybeJson(source.payload);
    source = { ...source, ...(nested && typeof nested === 'object' ? nested : {}) };
  }

  const applicant = parseMaybeJson(source.applicant);
  const financials = parseMaybeJson(source.financials);
  const telemetry = parseMaybeJson(source.telemetry);
  const documentOcr = parseMaybeJson(source.documentOcr);

  if (applicant && financials && telemetry && documentOcr) {
    return { applicant, financials, telemetry, documentOcr };
  }

  return {
    applicant: {
      name: source.applicantName ?? applicant?.name ?? '',
      companyName: source.companyName ?? applicant?.companyName ?? '',
      panNumber: source.panNumber ?? applicant?.panNumber ?? '',
      phone: source.phoneNumber ?? source.phone ?? applicant?.phone ?? '',
      email: source.email ?? applicant?.email ?? '',
    },
    financials: {
      declaredIncome: source.declaredIncome ?? financials?.declaredIncome,
      ocrBankIncome: source.ocrBankIncome ?? financials?.ocrBankIncome,
    },
    telemetry: {
      deviceId: source.deviceId ?? telemetry?.deviceId ?? '',
      ipAddress: source.ipAddress ?? telemetry?.ipAddress ?? '',
      ipLocation: source.ipLocation ?? telemetry?.ipLocation ?? '',
      deviceReuseCount: source.deviceReuseCount ?? telemetry?.deviceReuseCount,
    },
    documentOcr: {
      addressMatchScore: source.addressMatchScore ?? documentOcr?.addressMatchScore,
      documentTamperFlag: source.documentTamperFlag ?? documentOcr?.documentTamperFlag,
      uploadedBankStatement:
        source.uploadedBankStatement ??
        source.bankStatementFileName ??
        documentOcr?.uploadedBankStatement,
    },
  };
}

export default { evaluationSchema, parseEvaluatePayload };
