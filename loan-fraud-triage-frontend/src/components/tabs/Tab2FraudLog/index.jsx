import { useMemo, useState } from 'react';
import { Filter, Search } from 'lucide-react';
import Card from '../../common/Card';
import ApplicationTable from './ApplicationTable';
import ApplicationDetailModal from './ApplicationDetailModal';
import DecisionModal from './DecisionModal';
import PiiMaskingControls from './PiiMaskingControls';
import { useApplications } from '../../../hooks/useApplications';
import { useAppContext } from '../../../context';
import { maskApplication } from '../../../utils/piiMasker';
import {
  getApplicationById,
  patchApplicationDecision,
} from '../../../services/fraudService';

export default function Tab2FraudLog() {
  const { userRole } = useAppContext();
  const [query, setQuery] = useState('');
  const [riskTier, setRiskTier] = useState('ALL');
  const [forceMask, setForceMask] = useState(false);
  const { applications, loading, error, refresh } = useApplications(riskTier);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const [decisionRow, setDecisionRow] = useState(null);
  const [decisionSaving, setDecisionSaving] = useState(false);
  const [decisionError, setDecisionError] = useState(null);

  const effectiveRole =
    forceMask || userRole === 'GUEST' ? 'GUEST' : 'ANALYST';
  const canDecide = effectiveRole === 'ANALYST';

  const rows = useMemo(() => {
    return applications
      .filter((app) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          String(app.applicationId || '').toLowerCase().includes(q) ||
          String(app.applicantName || '').toLowerCase().includes(q) ||
          String(app.companyName || '').toLowerCase().includes(q)
        );
      })
      .map((app) => maskApplication(app, effectiveRole));
  }, [applications, query, effectiveRole]);

  const openDetails = async (applicationId) => {
    setDetailOpen(true);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    try {
      const record = await getApplicationById(applicationId);
      setDetail(record);
    } catch (err) {
      setDetailError(err.message || 'Unable to load application');
    } finally {
      setDetailLoading(false);
    }
  };

  const openDecision = (row) => {
    setDecisionError(null);
    setDecisionRow(row);
  };

  const submitDecision = async ({ decisionStatus, reviewerNotes }) => {
    const id = decisionRow?.applicationId || decisionRow?.id;
    if (!id) return;
    setDecisionSaving(true);
    setDecisionError(null);
    try {
      await patchApplicationDecision(id, { decisionStatus, reviewerNotes });
      setDecisionRow(null);
      if (detail?.applicationId === id) {
        setDetail((prev) =>
          prev ? { ...prev, decisionStatus, reviewerNotes } : prev
        );
      }
      await refresh();
    } catch (err) {
      setDecisionError(err.message || 'Failed to update decision');
    } finally {
      setDecisionSaving(false);
    }
  };

  return (
    <div className="flex w-full min-w-0 max-w-full flex-1 flex-col space-y-5 animate-fade-in">
      <Card
        className="w-full min-w-0 max-w-full"
        title="Fraud Application Log"
        subtitle="Live evaluations from GET /api/v1/applications. Open a row for the full record, or set a review decision."
        actions={
          <PiiMaskingControls
            userRole={userRole}
            forceMask={forceMask}
            onForceMaskChange={setForceMask}
          />
        }
      >
        <div className="mb-4 flex flex-wrap gap-3">
          <label className="relative min-w-[220px] flex-1">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by App ID, applicant, or company…"
              className="w-full rounded-xl border border-slate-600/70 bg-slate-950/60 py-2.5 pl-9 pr-3 text-sm text-slate-100 outline-none focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/25"
            />
          </label>
          <label className="relative">
            <Filter
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <select
              value={riskTier}
              onChange={(e) => setRiskTier(e.target.value)}
              className="appearance-none rounded-xl border border-slate-600/70 bg-slate-950/60 py-2.5 pl-9 pr-8 text-sm text-slate-100 outline-none focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/25"
            >
              <option value="ALL">All risk tiers</option>
              <option value="BLOCK">Block / Review</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </label>
        </div>

        {error && (
          <p className="mb-3 text-sm text-rose-300">{error}</p>
        )}

        <ApplicationTable
          rows={rows}
          loading={loading}
          onViewDetails={openDetails}
          onSetDecision={openDecision}
          canDecide={canDecide}
        />
      </Card>

      <ApplicationDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        record={detail}
        loading={detailLoading}
        error={detailError}
        canUnmask={canDecide}
        canDecide={canDecide}
        onSetDecision={(record) => {
          openDecision({
            applicationId: record?.applicationId,
            decisionStatus: record?.decisionStatus,
            reviewerNotes: record?.reviewerNotes,
          });
        }}
      />

      <DecisionModal
        open={Boolean(decisionRow)}
        onClose={() => setDecisionRow(null)}
        application={decisionRow}
        onSubmit={submitDecision}
        saving={decisionSaving}
        error={decisionError}
      />
    </div>
  );
}
