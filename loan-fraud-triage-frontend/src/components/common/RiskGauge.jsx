/**
 * Gauge coloring uses the evaluation UI bands:
 * Red > 70, Yellow 31–70, Green 0–30.
 */
export function getGaugeBand(score) {
  const value = Number(score);
  if (!Number.isFinite(value) || value > 70) {
    return {
      label: 'High',
      bar: 'bg-red-500',
      track: 'bg-red-500/15',
      text: 'text-red-400',
    };
  }
  if (value >= 31) {
    return {
      label: 'Medium',
      bar: 'bg-amber-400',
      track: 'bg-amber-400/15',
      text: 'text-amber-300',
    };
  }
  return {
    label: 'Low',
    bar: 'bg-emerald-500',
    track: 'bg-emerald-500/15',
    text: 'text-emerald-300',
  };
}

export default function RiskGauge({ score = 0 }) {
  const value = Math.min(100, Math.max(0, Number(score) || 0));
  const band = getGaugeBand(value);

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-950/50 px-4 py-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Visual Risk Gauge
        </span>
        <span className={`text-sm font-semibold tabular-nums ${band.text}`}>
          {value}/100 · {band.label}
        </span>
      </div>
      <div className={`h-2.5 overflow-hidden rounded-full ${band.track}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${band.bar}`}
          style={{ width: `${value}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Risk score ${value} out of 100`}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] uppercase tracking-wider text-slate-500">
        <span>0</span>
        <span>31</span>
        <span>70</span>
        <span>100</span>
      </div>
    </div>
  );
}
