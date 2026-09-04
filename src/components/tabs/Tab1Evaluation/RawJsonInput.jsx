export default function RawJsonInput({ value, onChange, error }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
        Raw JSON Payload
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={14}
        spellCheck={false}
        className={[
          'w-full rounded-xl border bg-slate-950/70 px-4 py-3 font-mono text-xs leading-relaxed text-teal-100 outline-none transition',
          error
            ? 'border-rose-500/60 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20'
            : 'border-slate-600/70 focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/25',
        ].join(' ')}
      />
      {error ? (
        <p className="mt-2 text-sm text-rose-300">{error}</p>
      ) : (
        <p className="mt-2 text-xs text-slate-500">
          Edits sync bidirectionally with Form View fields.
        </p>
      )}
    </div>
  );
}
