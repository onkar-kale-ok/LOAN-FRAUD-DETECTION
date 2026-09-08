export const RISK_TIERS = ['LOW', 'MEDIUM', 'HIGH', 'BLOCK'];

export function tierFromScore(riskScore) {
  if (riskScore >= 90) return 'BLOCK';
  if (riskScore >= 75) return 'HIGH';
  if (riskScore >= 40) return 'MEDIUM';
  return 'LOW';
}

export function statusFromTier(riskTier) {
  if (riskTier === 'BLOCK' || riskTier === 'HIGH') return 'FLAGGED';
  if (riskTier === 'MEDIUM') return 'UNDER_REVIEW';
  return 'CLEARED';
}

export function normalizeRiskTier(value, riskScore) {
  const upper = String(value || '')
    .toUpperCase()
    .replace(/[\s/-]+/g, '_');
  if (upper === 'BLOCK' || upper === 'BLOCK_REVIEW' || upper === 'BLOCKREVIEW') {
    return 'BLOCK';
  }
  if (['LOW', 'MEDIUM', 'HIGH'].includes(upper)) return upper;
  return tierFromScore(riskScore);
}

/**
 * Promote to BLOCK when corpus signals show a likely ring, even if the model said HIGH.
 */
export function applyBlockPromotion(riskTier, riskScore, crossApp, salary) {
  const severeRing =
    (crossApp?.computedDeviceReuseCount || 0) >= 4 ||
    ((crossApp?.duplicatePhone || crossApp?.duplicateEmail) &&
      (crossApp?.computedDeviceReuseCount || 0) >= 2);
  if (riskScore >= 90 || (riskTier === 'HIGH' && severeRing && salary?.flagged)) {
    return 'BLOCK';
  }
  return riskTier;
}

export default {
  RISK_TIERS,
  tierFromScore,
  statusFromTier,
  normalizeRiskTier,
  applyBlockPromotion,
};
