/**
 * Token-overlap match between declared address and OCR address (0–100).
 */
export function normalizeAddress(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function computeAddressMatchScore(declaredAddress, ocrAddress) {
  const a = new Set(normalizeAddress(declaredAddress).split(' ').filter((t) => t.length > 1));
  const b = new Set(normalizeAddress(ocrAddress).split(' ').filter((t) => t.length > 1));
  if (a.size === 0 || b.size === 0) return 0;
  let overlap = 0;
  for (const token of a) {
    if (b.has(token)) overlap += 1;
  }
  return Math.round((overlap / Math.max(a.size, b.size)) * 100);
}

export default { normalizeAddress, computeAddressMatchScore };
