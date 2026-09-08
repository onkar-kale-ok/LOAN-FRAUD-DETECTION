import { AlertTriangle, Loader2 } from 'lucide-react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import RiskBadge from '../../common/RiskBadge';
import PiiField from './PiiField';
import {
  formatCurrency,
  formatDate,
  getStatusClasses,
  getStatusLabel,
} from '../../../utils/formatters';

function Field({ label, children }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <div className="mt-0.5 text-sm text-slate-200">{children || '—'}</div>
    </div>
  );
}

function pick(record, ...paths) {
  for (const path of paths) {
    const value = path.split('.').reduce((acc, key) => acc?.[key], record);
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return '';
}

export default function ApplicationDetailModal({
  open,
  onClose,
  record,
  loading,
  error,
  canUnmask,
  onSetDecision,
  canDecide,
}) {
  const applicantName = pick(record, 'applicant.name', 'evaluationResult.applicantName', 'applicantName');
  const companyName = pick(record, 'applicant.companyName', 'evaluationResult.companyName', 'companyName');
  const pan = pick(record, 'applicant.panNumber', 'evaluationResult.panNumber');
  const phone = pick(record, 'applicant.phone', 'evaluationResult.phoneNumber');
  const email = pick(record, 'applicant.email', 'evaluationResult.email');
  const declared = pick(record, 'financials.declaredIncome', 'evaluationResult.declaredIncome');
  const ocr = pick(record, 'financials.ocrBankIncome', 'evaluationResult.ocrBankIncome');
  const deviceId = pick(record, 'telemetry.deviceId', 'evaluationResult.deviceId');
  const ipAddress = pick(record, 'telemetry.ipAddress', 'evaluationResult.ipAddress');
  const ipLocation = pick(record, 'telemetry.ipLocation', 'evaluationResult.ipLocation');
  const redFlags = record?.redFlags || record?.evaluationResult?.redFlags || [];
  const decision = record?.decisionStatus || 'PENDING_REVIEW';
  const appId = record?.applicationId;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={appId ? `Application ${appId}` : 'Application details'}
      className="max-w-2xl max-h-[85vh] overflow-y-auto"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={!canDecide || !appId}
            onClick={() => onSetDecision(record)}
          >
            Update decision
          </Button>
        </>
      }
    >
      {loading && (
        <div className="flex items-center gap-2 text-slate-300">
          <Loader2 size={16} className="animate-spin text-teal-400" />
          Loading full application…
        </div>
      )}
      {error && <p className="text-sm text-rose-300">{error}</p>}
      {!loading && !error && record && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <RiskBadge score={record.riskScore} tier={record.riskTier} />
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${getStatusClasses(decision)}`}
            >
              {getStatusLabel(decision)}
            </span>
            <span className="text-xs text-slate-500">
              {formatDate(record.applicationTimestamp || record.evaluatedAt)}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Applicant">{applicantName}</Field>
            <Field label="Company">{companyName}</Field>
            <Field label="PAN">
              <PiiField value={pan} kind="pan" canUnmask={canUnmask} />
            </Field>
            <Field label="Phone">
              <PiiField value={phone} kind="phone" canUnmask={canUnmask} />
            </Field>
            <Field label="Email">{email}</Field>
            <Field label="Declared address">
              {pick(record, 'applicant.address', 'evaluationResult.address')}
            </Field>
            <Field label="OCR address">
              {pick(record, 'documentOcr.ocrExtractedAddress', 'evaluationResult.ocrExtractedAddress')}
            </Field>
            <Field label="Application timestamp">
              {formatDate(
                pick(record, 'applicationTimestamp', 'telemetry.applicationTimestamp')
              )}
            </Field>
            <Field label="Statement summary">
              {pick(record, 'financials.bankStatementSummary', 'evaluationResult.bankStatementSummary')}
            </Field>
            <Field label="Income (declared / OCR)">
              {formatCurrency(declared)}
              <span className="mx-1 text-slate-600">/</span>
              {formatCurrency(ocr)}
            </Field>
            <Field label="Device">{deviceId}</Field>
            <Field label="IP / Location">
              {ipAddress}
              {ipLocation ? ` · ${ipLocation}` : ''}
            </Field>
          </div>

          {record.reviewerNotes ? (
            <Field label="Reviewer notes">{record.reviewerNotes}</Field>
          ) : null}

          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Red flags
            </p>
            {redFlags.length ? (
              <ul className="space-y-2">
                {redFlags.map((flag, index) => (
                  <li
                    key={flag.code || flag.label || index}
                    className="flex gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2"
                  >
                    <AlertTriangle size={14} className="mt-0.5 shrink-0 text-rose-400" />
                    <div>
                      <p className="text-sm font-semibold text-rose-200">
                        {flag.label || flag.code || 'Flag'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {flag.evidence || 'No evidence provided.'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No red flags recorded.</p>
            )}
          </div>

          {record.aiReviewerNote || record.evaluationResult?.aiReviewerNote ? (
            <Field label="AI reviewer note">
              {record.aiReviewerNote || record.evaluationResult.aiReviewerNote}
            </Field>
          ) : null}
        </div>
      )}
    </Modal>
  );
}
