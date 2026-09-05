import { AlertTriangle } from 'lucide-react';

export default function RawJsonInput({ value, onChange, error }) {
  return (
    <div>
      {error && (
        <div
          role="alert"
          className="mb-3 flex items-start gap-3 rounded-xl border border-red-500 bg-red-500/10 px-3.5 py-3"
        >
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-red-400">Invalid JSON</p>
            <p className="mt-1 text-xs text-red-500">
              {error} Submission is disabled until the payload parses successfully.
            </p>
          </div>
        </div>
      )}

      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
        Raw JSON Payload
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={22}
        spellCheck={false}
        aria-invalid={Boolean(error)}
        className={[
          'w-full rounded-xl border bg-slate-950/70 px-4 py-3 font-mono text-xs leading-relaxed text-teal-100 outline-none transition',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
            : 'border-slate-600/70 focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/25',
        ].join(' ')}
      />
      {error ? (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      ) : (
        <p className="mt-2 text-xs text-slate-500">
          Edits sync bidirectionally with Form View fields.
        </p>
      )}
    </div>
  );
}
