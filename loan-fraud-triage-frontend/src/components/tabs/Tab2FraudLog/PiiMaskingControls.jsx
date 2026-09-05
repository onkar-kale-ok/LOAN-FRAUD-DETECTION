export default function PiiMaskingControls({
  userRole,
  forceMask,
  onForceMaskChange,
}) {
  const isGuest = userRole === 'GUEST';

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      <span
        className={[
          'rounded-md px-2.5 py-1 font-semibold ring-1',
          isGuest
            ? 'bg-amber-500/10 text-amber-200 ring-amber-400/30'
            : 'bg-teal-500/10 text-teal-200 ring-teal-400/30',
        ].join(' ')}
      >
        Role: {userRole}
      </span>
      <label className="inline-flex cursor-pointer items-center gap-2 text-slate-300">
        <input
          type="checkbox"
          checked={forceMask || isGuest}
          disabled={isGuest}
          onChange={(e) => onForceMaskChange(e.target.checked)}
          className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-900 text-teal-500 focus:ring-teal-400/40"
        />
        Mask identifiers
        {isGuest && <span className="text-slate-500">(enforced by GUEST)</span>}
      </label>
    </div>
  );
}
