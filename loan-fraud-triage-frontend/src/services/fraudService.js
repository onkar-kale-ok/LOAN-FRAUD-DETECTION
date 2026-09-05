import api from './api';

export function buildEvaluatePayload(formData = {}) {
  return {
    applicant: {
      name: String(formData.applicantName || '').trim(),
      companyName: String(formData.companyName || '').trim() || 'N/A',
      panNumber: String(formData.panNumber || '')
        .trim()
        .toUpperCase(),
      phone: String(formData.phoneNumber || formData.phone || '').trim(),
      email: String(formData.email || '').trim(),
    },
    financials: {
      declaredIncome: Number(formData.declaredIncome) || 0,
      ocrBankIncome: Number(formData.ocrBankIncome) || 0,
    },
    telemetry: {
      deviceId: String(formData.deviceId || '').trim(),
      ipAddress: String(formData.ipAddress || '').trim(),
      ipLocation: String(formData.ipLocation || '').trim(),
      deviceReuseCount: Number(formData.deviceReuseCount) || 0,
    },
    documentOcr: {
      addressMatchScore: Number(formData.addressMatchScore) || 0,
      documentTamperFlag: Boolean(formData.documentTamperFlag),
      uploadedBankStatement: formData.bankStatementFileName || undefined,
    },
  };
}

function flattenRecord(record = {}, applicationId) {
  const applicant = record.applicant || {};
  const financials = record.financials || {};
  const telemetry = record.telemetry || {};
  const documentOcr = record.documentOcr || {};

  return {
    applicationId: record.applicationId || applicationId,
    analyzedAt: record.analyzedAt || record.evaluatedAt,
    applicantName: applicant.name || record.applicantName,
    companyName: applicant.companyName || record.companyName,
    panNumber: applicant.panNumber || record.panNumber,
    phoneNumber: applicant.phone || record.phoneNumber,
    email: applicant.email || record.email,
    declaredIncome: financials.declaredIncome ?? record.declaredIncome,
    ocrBankIncome: financials.ocrBankIncome ?? record.ocrBankIncome,
    deviceId: telemetry.deviceId || record.deviceId,
    ipAddress: telemetry.ipAddress || record.ipAddress,
    ipLocation: telemetry.ipLocation || record.ipLocation,
    deviceReuseCount: telemetry.deviceReuseCount ?? record.deviceReuseCount,
    addressMatchScore: documentOcr.addressMatchScore ?? record.addressMatchScore,
    documentTamperFlag:
      documentOcr.documentTamperFlag ?? record.documentTamperFlag,
    bankStatementFileName:
      documentOcr.uploadedBankStatement ||
      record.bankStatement?.originalName ||
      record.bankStatementFileName ||
      '',
    bankStatementParsed: Boolean(record.bankStatement || record.bankStatementParsed),
    riskScore: record.riskScore,
    riskTier: record.riskTier,
    status: record.status,
    redFlags: record.redFlags || [],
    aiReviewerNote: record.aiReviewerNote,
    engineSource: record.engineSource,
    llmError: record.llmError,
  };
}

export async function submitEvaluation(formData, bankStatementFile) {
  const payload = buildEvaluatePayload(formData);
  const body = new FormData();
  body.append('payload', JSON.stringify(payload));
  if (bankStatementFile instanceof File) {
    body.append('bankStatement', bankStatementFile, bankStatementFile.name);
  }

  const response = await api.post('/v1/evaluate', body);

  if (response.status !== 200 || response.data?.success === false) {
    const err = new Error(response.data?.message || 'Evaluation failed');
    err.status = response.status;
    throw err;
  }

  const evaluationResult =
    response.data?.evaluationResult ||
    response.data?.data?.evaluationResult ||
    flattenRecord(response.data?.data, response.data?.applicationId);

  if (evaluationResult?.riskScore == null && !evaluationResult?.riskTier) {
    throw new Error('Evaluation response missing evaluationResult');
  }

  return evaluationResult;
}

/** @deprecated Prefer submitEvaluation — evaluate is no longer mock-backed. */
export async function analyzeApplication(payload, bankStatementFile) {
  return submitEvaluation(payload, bankStatementFile);
}

export async function getApplications(riskTier) {
  const params =
    riskTier && riskTier !== 'ALL' ? { riskTier } : undefined;
  const response = await api.get('/v1/applications', { params });
  const list = response.data?.data ?? response.data;
  return Array.isArray(list) ? list : [];
}

export async function getApplicationById(id) {
  const response = await api.get(`/v1/applications/${id}`);
  if (response.status !== 200 || response.data?.success === false) {
    const err = new Error(response.data?.message || 'Application not found');
    err.status = response.status;
    throw err;
  }
  return response.data?.data ?? response.data;
}

export async function patchApplicationDecision(id, { decisionStatus, reviewerNotes }) {
  const response = await api.patch(`/v1/applications/${id}/decision`, {
    decisionStatus,
    reviewerNotes: reviewerNotes ?? '',
  });
  if (response.status !== 200 || response.data?.success === false) {
    const err = new Error(response.data?.message || 'Failed to update decision');
    err.status = response.status;
    throw err;
  }
  return response.data?.data ?? response.data;
}

export async function sendAssistantQuery(id, message) {
  const response = await api.post(`/v1/applications/${id}/chat`, { message });

  if (response.status !== 200 || response.data?.success === false) {
    const err = new Error(response.data?.message || 'Chat request failed');
    err.status = response.status;
    throw err;
  }

  const body = response.data;
  return {
    role: 'assistant',
    content: body?.data?.content || body?.reply || '',
    timestamp: body?.data?.timestamp || new Date().toISOString(),
  };
}

export async function getChatHistory(id) {
  const response = await api.get(`/v1/applications/${id}/chat/history`);
  if (response.status !== 200 || response.data?.success === false) {
    const err = new Error(response.data?.message || 'Failed to load chat history');
    err.status = response.status;
    throw err;
  }
  const history = response.data?.history ?? response.data?.data;
  return Array.isArray(history) ? history : [];
}

export async function getScenarios() {
  const response = await api.get('/v1/scenarios');
  return response.data;
}

const fraudService = {
  analyzeApplication,
  submitEvaluation,
  getApplications,
  getApplicationById,
  patchApplicationDecision,
  sendAssistantQuery,
  getChatHistory,
  getScenarios,
};

export default fraudService;
