import { AlertTriangle, CheckCircle2, Loader2, StickyNote } from 'lucide-react';
import Card from '../../common/Card';
import RiskBadge from '../../common/RiskBadge';
import { formatDate } from '../../../utils/formatters';

export default function ResultPanel({ result, loading }) {
  if (loading) {
    return (
      <Card className="animate-pulse-soft">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="animate-spin text-teal-400" size={20} />
          <p className="text-sm font-medium">Running AI fraud evaluation…</p>
        </div>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card>
        <div className="flex items-start gap-3 text-slate-400">
          <StickyNote size={18} className="mt-0.5 shrink-0 text-slate-500" />
          <p className="text-sm">
            Results will appear here after you run an evaluation — risk score badge,
            red flags with evidence, and the AI reviewer note.
          </p>
        </div>
      </Card>
    );
  }

  const hasFlags = result.redFlags?.length > 0;

  return (
    <Card
      title="Evaluation Result"
      subtitle={`Application ${result.applicationId} · Analyzed ${formatDate(result.analyzedAt)}`}
      actions={<RiskBadge score={result.riskScore} tier={result.riskTier} />}
      className="result-reveal"
    >
      <div className="space-y-5">
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Red Flags
          </h4>
          {hasFlags ? (
            <ul className="space-y-2">
              {result.redFlags.map((flag) => (
                <li
                  key={flag.code}
                  className="flex gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-3.5 py-3"
                >
                  <AlertTriangle
                    size={16}
                    className="mt-0.5 shrink-0 text-rose-400"
                  />
                  <div>
                    <p className="text-sm font-semibold text-rose-200">
                      {flag.label}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-400">{flag.evidence}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3.5 py-3 text-sm text-emerald-200">
              <CheckCircle2 size={16} />
              No material red flags detected.
            </div>
          )}
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            AI Reviewer Note
          </h4>
          <blockquote className="rounded-xl border border-slate-700/60 bg-slate-950/50 px-4 py-3 text-sm leading-relaxed text-slate-300">
            {result.aiReviewerNote}
          </blockquote>
        </div>
      </div>
    </Card>
  );
}
