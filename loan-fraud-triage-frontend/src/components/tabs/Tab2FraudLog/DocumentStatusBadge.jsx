export function getBankStatementStatus(app = {}) {
  const uploaded = Boolean(app.bankStatementParsed || app.bankStatementFileName);
  if (!uploaded) {
    return {
      key: 'MISSING',
      label: 'Missing',
      className: 'bg-slate-500/10 text-slate-300 ring-1 ring-slate-400/30',
    };
  }
  if (app.documentTamperFlag) {
    return {
      key: 'TAMPERED',
      label: 'Uploaded - Tampered ⚠️',
      className: 'bg-red-500/10 text-red-300 ring-1 ring-red-400/40',
    };
  }
  return {
    key: 'CLEAN',
    label: 'Uploaded - Clean',
    className: 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/30',
  };
}

export default function DocumentStatusBadge({ app }) {
  const status = getBankStatementStatus(app);
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${status.className}`}
    >
      {status.label}
    </span>
  );
}
