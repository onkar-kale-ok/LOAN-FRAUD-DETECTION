export function timestampMs(value) {
  const ms = Date.parse(value || '');
  return Number.isFinite(ms) ? ms : 0;
}

export function getApplicationTimestamp(record = {}) {
  return (
    record.applicationTimestamp ||
    record.evaluatedAt ||
    record.evaluationResult?.analyzedAt ||
    record.updatedAt ||
    null
  );
}

export function getDecisionStatus(record = {}) {
  if (record.decisionStatus) return record.decisionStatus;
  const legacy = String(record.status || record.evaluationResult?.status || '').toUpperCase();
  if (legacy === 'FLAGGED') return 'FLAGGED_FOR_AUDIT';
  if (legacy === 'CLEARED') return 'APPROVED';
  if (legacy === 'UNDER_REVIEW') return 'PENDING_REVIEW';
  return 'PENDING_REVIEW';
}

export function toListItem(record) {
  const applicant = record.applicant || {};
  const evaluationResult = record.evaluationResult || {};
  const redFlags = record.redFlags || evaluationResult.redFlags || [];

  return {
    applicationId: record.applicationId,
    applicantName: applicant.name || evaluationResult.applicantName || '',
    companyName: applicant.companyName || evaluationResult.companyName || '',
    applicationTimestamp: getApplicationTimestamp(record),
    riskTier: record.riskTier || evaluationResult.riskTier || null,
    riskScore: record.riskScore ?? evaluationResult.riskScore ?? null,
    decisionStatus: getDecisionStatus(record),
    redFlagsCount: Array.isArray(redFlags) ? redFlags.length : 0,
  };
}

export function buildApplicationList(records, { riskTier } = {}) {
  const filter = String(riskTier || '').trim().toUpperCase();
  let rows = (Array.isArray(records) ? records : []).map(toListItem);

  if (filter) {
    rows = rows.filter((row) => String(row.riskTier || '').toUpperCase() === filter);
  }

  rows.sort(
    (a, b) => timestampMs(b.applicationTimestamp) - timestampMs(a.applicationTimestamp)
  );

  return rows;
}

export default {
  timestampMs,
  getApplicationTimestamp,
  getDecisionStatus,
  toListItem,
  buildApplicationList,
};
