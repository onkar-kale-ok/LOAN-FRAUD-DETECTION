import { Eye, Gavel } from 'lucide-react';
import RiskBadge from '../../common/RiskBadge';
import Button from '../../common/Button';
import { formatDate, getStatusClasses, getStatusLabel } from '../../../utils/formatters';

export default function ApplicationTable({
  rows,
  loading,
  onViewDetails,
  onSetDecision,
  canDecide = false,
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
        No evaluated applications yet. Run an AI evaluation to populate this log.
      </p>
    );
  }

  return (
    <div className="w-full min-w-0 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
      <table className="w-full min-w-[960px] divide-y divide-slate-700/50 text-left text-sm">
        <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-400">
          <tr>
            <th className="whitespace-nowrap px-4 py-3.5 font-semibold">App ID</th>
            <th className="whitespace-nowrap px-4 py-3.5 font-semibold">Applicant</th>
            <th className="whitespace-nowrap px-4 py-3.5 font-semibold">Company</th>
            <th className="whitespace-nowrap px-4 py-3.5 font-semibold">Timestamp</th>
            <th className="whitespace-nowrap px-4 py-3.5 font-semibold">Risk</th>
            <th className="whitespace-nowrap px-4 py-3.5 font-semibold">Decision</th>
            <th className="whitespace-nowrap px-4 py-3.5 font-semibold">Red Flags</th>
            <th className="whitespace-nowrap px-4 py-3.5 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">
          {rows.map((row) => {
            const appId = row.applicationId || row.id;
            const decision = row.decisionStatus || 'PENDING_REVIEW';

            return (
              <tr
                key={appId}
                className="bg-slate-900/30 transition hover:bg-slate-800/40"
              >
                <td className="whitespace-nowrap px-4 py-3.5">
                  <button
                    type="button"
                    onClick={() => onViewDetails(appId)}
                    className="font-mono text-xs font-semibold text-teal-300 hover:text-teal-200 hover:underline"
                  >
                    {appId}
                  </button>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 font-medium text-slate-100">
                  {row.applicantName || '—'}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-slate-300">
                  {row.companyName || '—'}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-slate-400">
                  {formatDate(row.applicationTimestamp)}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5">
                  <RiskBadge score={row.riskScore} tier={row.riskTier} />
                </td>
                <td className="whitespace-nowrap px-4 py-3.5">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${getStatusClasses(decision)}`}
                  >
                    {getStatusLabel(decision)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-slate-300">
                  {row.redFlagsCount ?? 0}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onViewDetails(appId)}
                    >
                      <Eye size={14} />
                      Details
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onSetDecision(row)}
                      disabled={!canDecide}
                    >
                      <Gavel size={14} />
                      Decision
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
