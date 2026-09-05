import { useEffect, useState } from 'react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';

export const DECISION_STATUSES = [
  'PENDING_REVIEW',
  'APPROVED',
  'REJECTED',
  'FLAGGED_FOR_AUDIT',
];

const LABELS = {
  PENDING_REVIEW: 'Pending Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  FLAGGED_FOR_AUDIT: 'Flagged for Audit',
};

export default function DecisionModal({
  open,
  onClose,
  application,
  onSubmit,
  saving,
  error,
}) {
  const [decisionStatus, setDecisionStatus] = useState('PENDING_REVIEW');
  const [reviewerNotes, setReviewerNotes] = useState('');

  useEffect(() => {
    if (!open) return;
    setDecisionStatus(application?.decisionStatus || 'PENDING_REVIEW');
    setReviewerNotes(application?.reviewerNotes || '');
  }, [open, application]);

  const appId = application?.applicationId || application?.id;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={appId ? `Decision · ${appId}` : 'Update decision'}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={saving || !appId}
            onClick={() => onSubmit({ decisionStatus, reviewerNotes })}
          >
            {saving ? 'Saving…' : 'Save decision'}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Decision status
          </span>
          <select
            value={decisionStatus}
            onChange={(e) => setDecisionStatus(e.target.value)}
            className="w-full rounded-xl border border-slate-600/70 bg-slate-950/60 px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/25"
          >
            {DECISION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {LABELS[status]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Reviewer notes
          </span>
          <textarea
            rows={4}
            value={reviewerNotes}
            onChange={(e) => setReviewerNotes(e.target.value)}
            placeholder="Optional notes for the audit trail"
            className="w-full rounded-xl border border-slate-600/70 bg-slate-950/60 px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/25"
          />
        </label>
        {error && <p className="text-sm text-rose-300">{error}</p>}
      </div>
    </Modal>
  );
}
