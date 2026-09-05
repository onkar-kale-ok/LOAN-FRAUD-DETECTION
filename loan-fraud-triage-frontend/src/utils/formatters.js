/**
 * Currency, date, and risk-tier formatting helpers.
 */

export function formatCurrency(amount, locale = 'en-IN', currency = 'INR') {
  const value = Number(amount);
  if (Number.isNaN(value)) return '—';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatFileSize(bytes) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) return '—';
  if (value < 1024) return `${value} B`;
  const kb = value / 1024;
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}

export function formatTime(iso, locale = 'en-IN') {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatDate(iso, locale = 'en-IN') {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function getRiskTier(scoreOrTier) {
  if (typeof scoreOrTier === 'string') {
    const upper = scoreOrTier.toUpperCase();
    if (['HIGH', 'MEDIUM', 'LOW'].includes(upper)) return upper;
  }
  const score = Number(scoreOrTier);
  if (score >= 75) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}

export function getRiskColorClasses(tierOrScore) {
  const tier = getRiskTier(tierOrScore);
  switch (tier) {
    case 'HIGH':
      return {
        tier: 'HIGH',
        badge: 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/40',
        bar: 'bg-rose-500',
        text: 'text-rose-300',
        border: 'border-rose-500/30',
      };
    case 'MEDIUM':
      return {
        tier: 'MEDIUM',
        badge: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/40',
        bar: 'bg-amber-500',
        text: 'text-amber-300',
        border: 'border-amber-500/30',
      };
    default:
      return {
        tier: 'LOW',
        badge: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/40',
        bar: 'bg-emerald-500',
        text: 'text-emerald-300',
        border: 'border-emerald-500/30',
      };
  }
}

export function getStatusLabel(status = '') {
  const map = {
    FLAGGED: 'Flagged',
    UNDER_REVIEW: 'Under Review',
    CLEARED: 'Cleared',
    EVALUATED: 'Evaluated',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    FLAGGED_FOR_AUDIT: 'Flagged for Audit',
    PENDING_REVIEW: 'Pending Review',
  };
  return map[status] || status || 'Unknown';
}

export function getStatusClasses(status = '') {
  switch (status) {
    case 'FLAGGED':
    case 'REJECTED':
    case 'FLAGGED_FOR_AUDIT':
      return 'bg-rose-500/10 text-rose-300 ring-1 ring-rose-400/30';
    case 'UNDER_REVIEW':
    case 'PENDING_REVIEW':
      return 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-400/30';
    case 'CLEARED':
    case 'APPROVED':
      return 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/30';
    default:
      return 'bg-slate-500/10 text-slate-300 ring-1 ring-slate-400/30';
  }
}

export default {
  formatCurrency,
  formatFileSize,
  formatDate,
  formatTime,
  getRiskTier,
  getRiskColorClasses,
  getStatusLabel,
  getStatusClasses,
};
