import { useState } from 'react';
import { AlertTriangle, Check, CheckCircle2, Copy, Download, Loader2, StickyNote } from 'lucide-react';
import Card from '../../common/Card';
import Button from '../../common/Button';
import RiskBadge from '../../common/RiskBadge';
import RiskGauge from '../../common/RiskGauge';
import ComparisonTable from './ComparisonTable';
import { formatDate } from '../../../utils/formatters';

function ApplicationIdBadge({ applicationId }) {
  const [copied, setCopied] = useState(false);

  if (!applicationId) return null;

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(applicationId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600/70 bg-slate-950/60 px-2.5 py-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        Application ID
      </span>
      <span className="font-mono text-xs font-semibold text-teal-300">{applicationId}</span>
      <button
        type="button"
        onClick={copyId}
        className="rounded p-0.5 text-slate-400 transition hover:bg-slate-800 hover:text-teal-200"
        aria-label="Copy application ID"
        title={copied ? 'Copied' : 'Copy application ID'}
      >
        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
      </button>
    </div>
  );
}

function exportAuditReport(result) {
  const payload = {
    exportedAt: new Date().toISOString(),
    reportType: 'FRAUD_EVALUATION_AUDIT',
    ...result,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `audit-report-${result.applicationId || 'evaluation'}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

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
            Results will appear here after you run an evaluation — risk gauge,
            declared vs OCR comparison, red flags, and the AI reviewer note.
          </p>
        </div>
      </Card>
    );
  }

  const hasFlags = result.redFlags?.length > 0;

  return (
    <Card
      title="Evaluation Result"
      subtitle={`Analyzed ${formatDate(result.analyzedAt || result.evaluatedAt)}`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <ApplicationIdBadge applicationId={result.applicationId} />
          <RiskBadge score={result.riskScore} tier={result.riskTier} />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => exportAuditReport(result)}
          >
            <Download size={14} />
            Export Audit Report (JSON)
          </Button>
        </div>
      }
      className="result-reveal"
    >
      <div className="space-y-5">
        <RiskGauge score={result.riskScore} />
        {result.deviceReuseCount != null && (
          <p className="text-xs text-slate-500">
            Device reuse computed from stored applications: {result.deviceReuseCount}
            {result.reportedDeviceReuseCount != null
              ? ` (form reported ${result.reportedDeviceReuseCount})`
              : ''}
            {result.computedAddressMatch != null
              ? ` · Address overlap ${result.computedAddressMatch}%`
              : ''}
          </p>
        )}
        <ComparisonTable result={result} />

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Red Flags
          </h4>
          {hasFlags ? (
            <ul className="space-y-2">
              {result.redFlags.map((flag, index) => (
                <li
                  key={flag.code || flag.label || index}
                  className="flex gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-3.5 py-3"
                >
                  <AlertTriangle
                    size={16}
                    className="mt-0.5 shrink-0 text-rose-400"
                  />
                  <div>
                    <p className="text-sm font-semibold text-rose-200">
                      {flag.label || flag.code || 'Flag'}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-400">
                      {flag.evidence || 'No evidence provided.'}
                    </p>
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
