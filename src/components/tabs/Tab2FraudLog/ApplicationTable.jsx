export default function ApplicationTable({
  rows,
  loading,
  formatCurrency,
  getStatusClasses,
  getStatusLabel,
  RiskBadge,
  Badge,
  onInvestigate,
  Button,
  ArrowRight,
}) {
  if (loading && !rows.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        Loading applications…
      </p>
    );
  }

  if (!rows.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        No applications match the current filters.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700/50">
      <table className="min-w-full divide-y divide-slate-700/50 text-left text-sm">
        <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-400">
          <tr>
            <th className="px-4 py-3 font-semibold">App ID</th>
            <th className="px-4 py-3 font-semibold">Applicant Name</th>
            <th className="px-4 py-3 font-semibold">Declared Income</th>
            <th className="px-4 py-3 font-semibold">OCR Income</th>
            <th className="px-4 py-3 font-semibold">Risk Score</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">
          {rows.map((row) => (
            <tr
              key={row.id}
              className="bg-slate-900/30 transition hover:bg-slate-800/40"
            >
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-teal-300">
                {row.id}
              </td>
              <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-100">
                {row.applicantName}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-300">
                {formatCurrency(row.declaredIncome)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-300">
                {formatCurrency(row.ocrIncome)}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <RiskBadge score={row.riskScore} tier={row.riskTier} />
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <Badge className={getStatusClasses(row.status)}>
                  {getStatusLabel(row.status)}
                </Badge>
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onInvestigate(row.id)}
                >
                  Investigate in AI Assistant
                  <ArrowRight size={14} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
