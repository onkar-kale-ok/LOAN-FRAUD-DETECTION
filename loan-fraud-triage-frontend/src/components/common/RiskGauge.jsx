import { getRiskColorClasses, getRiskTier } from '../../utils/formatters';

/**
 * Gauge bands match prompt, backend, and RiskBadge:
 * HIGH >= 75, MEDIUM >= 40, LOW 0–39.
 */
export function getGaugeBand(score) {
  const colors = getRiskColorClasses(score);
  const tier = getRiskTier(score);
  return {
    label: tier,
    bar: colors.bar,
    track:
      tier === 'BLOCK'
        ? 'bg-fuchsia-500/15'
        : tier === 'HIGH'
        ? 'bg-rose-500/15'
        : tier === 'MEDIUM'
          ? 'bg-amber-500/15'
          : 'bg-emerald-500/15',
    text: colors.text,
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
          aria-label={`Risk score ${value} out of 100, ${band.label}`}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] uppercase tracking-wider text-slate-500">
        <span>0</span>
        <span>40</span>
        <span>75</span>
        <span>90</span>
        <span>100</span>
      </div>
    </div>
  );
}
