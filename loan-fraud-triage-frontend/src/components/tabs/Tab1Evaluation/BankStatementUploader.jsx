import { useRef, useState } from 'react';
import { FileUp, X } from 'lucide-react';
import Button from '../../common/Button';
import { formatFileSize } from '../../../utils/formatters';
import { isPdfFile } from '../../../utils/ocrSimulator';

const BASE_INPUT =
  'w-full rounded-xl border bg-slate-950/60 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition';
const INPUT_OK =
  'border-slate-600/70 focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/25';
const INPUT_ERR =
  'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/25';

function inputClass(hasError) {
  return [BASE_INPUT, hasError ? INPUT_ERR : INPUT_OK].join(' ');
}

function FieldLabel({ children }) {
  return (
    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
      {children}
    </span>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

function ToggleField({ label, checked, onChange, description }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-600/70 bg-slate-950/60 px-3.5 py-2.5">
      <div>
        <p className="text-sm font-medium text-slate-100">{label}</p>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'relative h-6 w-11 shrink-0 rounded-full transition',
          checked ? 'bg-teal-500' : 'bg-slate-600',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition',
            checked ? 'left-5' : 'left-0.5',
          ].join(' ')}
        />
      </button>
    </div>
  );
}

export default function BankStatementUploader({
  formData,
  errors = {},
  onChange,
  onBlur,
  onFileSelected,
  onClearFile,
}) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState('');

  const fileName = formData.bankStatementFileName;
  const parsed = Boolean(formData.bankStatementParsed && fileName);

  const acceptFile = (file) => {
    if (!isPdfFile(file)) {
      setFileError('Only PDF bank statements are accepted.');
      return;
    }
    setFileError('');
    onFileSelected?.(file);
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) acceptFile(file);
  };

  return (
    <div className="space-y-4 sm:col-span-2">
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDrop={onDrop}
        className={[
          'rounded-xl border-2 border-dashed px-4 py-6 text-center transition',
          dragActive
            ? 'border-teal-400 bg-teal-500/10'
            : fileError
              ? 'border-red-500/70 bg-red-500/5'
              : 'border-slate-600/80 bg-slate-950/40',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) acceptFile(file);
            e.target.value = '';
          }}
        />
        <FileUp className="mx-auto mb-2 text-teal-300" size={22} />
        <p className="text-sm font-medium text-slate-100">
          Attach bank-statement PDF (sent to the LLM)
        </p>
        <p className="mt-1 text-xs text-slate-500">
          The PDF is the source of truth for statement evidence. OCR income and address
          fields below stay as you entered them (or from a scenario); they are not
          simulated from this file.
        </p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-3"
          onClick={() => inputRef.current?.click()}
        >
          Browse PDF
        </Button>
        {fileError && <p className="mt-2 text-xs text-red-500">{fileError}</p>}
      </div>

      {parsed && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-700/70 bg-slate-950/60 px-3.5 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-sm text-slate-100">{fileName}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {formData.bankStatementMock
                ? 'Scenario filename only — attach a PDF to send it to the LLM'
                : formatFileSize(formData.bankStatementFileSize)}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/15 px-2.5 py-1 text-xs font-semibold text-teal-300 ring-1 ring-teal-400/40">
            {formData.bankStatementMock ? 'Filename from scenario' : 'PDF attached for LLM'}
          </span>
          <button
            type="button"
            onClick={onClearFile}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
            aria-label="Remove bank statement"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <FieldLabel>OCR Bank Income (₹ annual)</FieldLabel>
          <p className="mb-1.5 text-[11px] text-slate-500">
            Manual / scenario field. Not overwritten by the attached PDF.
          </p>
          <input
            type="number"
            min={0}
            max={100000000}
            value={formData.ocrBankIncome ?? ''}
            onChange={(e) => onChange('ocrBankIncome', e.target.value)}
            onBlur={() => onBlur?.('ocrBankIncome')}
            placeholder="540000"
            className={inputClass(errors.ocrBankIncome)}
            aria-invalid={Boolean(errors.ocrBankIncome)}
          />
          <FieldError message={errors.ocrBankIncome} />
        </label>
        <label className="block">
          <FieldLabel>Address Match % (declared vs OCR)</FieldLabel>
          <p className="mb-1.5 text-[11px] text-slate-500">
            Auto-computed from declared address vs OCR address. You can override.
          </p>
          <input
            type="number"
            min={0}
            max={100}
            value={formData.addressMatchScore ?? ''}
            onChange={(e) => onChange('addressMatchScore', e.target.value)}
            onBlur={() => onBlur?.('addressMatchScore')}
            placeholder="45"
            className={inputClass(errors.addressMatchScore)}
            aria-invalid={Boolean(errors.addressMatchScore)}
          />
          <FieldError message={errors.addressMatchScore} />
        </label>
        <label className="block sm:col-span-2">
          <FieldLabel>OCR Extracted Address</FieldLabel>
          <textarea
            rows={3}
            value={formData.ocrExtractedAddress ?? ''}
            onChange={(e) => onChange('ocrExtractedAddress', e.target.value)}
            onBlur={() => onBlur?.('ocrExtractedAddress')}
            placeholder="Address extracted from bank statement OCR"
            className={inputClass(errors.ocrExtractedAddress)}
            aria-invalid={Boolean(errors.ocrExtractedAddress)}
          />
          <FieldError message={errors.ocrExtractedAddress} />
        </label>
        <label className="block sm:col-span-2">
          <FieldLabel>Bank Statement Summary</FieldLabel>
          <textarea
            rows={3}
            value={formData.bankStatementSummary ?? ''}
            onChange={(e) => onChange('bankStatementSummary', e.target.value)}
            onBlur={() => onBlur?.('bankStatementSummary')}
            placeholder="Salary credits, cash deposits, employer narration, annualised inflows"
            className={inputClass(errors.bankStatementSummary)}
            aria-invalid={Boolean(errors.bankStatementSummary)}
          />
          <FieldError message={errors.bankStatementSummary} />
        </label>
        <div className="sm:col-span-2">
          <ToggleField
            label="Document Tampering Detected"
            description="Optical/metadata check for document editing"
            checked={Boolean(formData.documentTamperFlag)}
            onChange={(v) => onChange('documentTamperFlag', v)}
          />
        </div>
        <label className="block sm:col-span-2">
          <FieldLabel>Suspicious Metadata</FieldLabel>
          <input
            type="text"
            value={formData.suspiciousMetadata ?? ''}
            onChange={(e) => onChange('suspiciousMetadata', e.target.value)}
            placeholder="PDF header warnings (producer, dates, overlays)"
            className={inputClass(false)}
          />
        </label>
      </div>
    </div>
  );
}
