import { ChevronDown } from 'lucide-react';

export default function ScenarioSelector({
  scenarios = [],
  evaluatedIds = {},
  value,
  onChange,
}) {
  return (
    <label className="relative block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
        Scenario Preset Selector
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-slate-600/70 bg-slate-950/60 py-3 pl-4 pr-10 text-sm text-slate-100 outline-none transition focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/25"
      >
        <option value="">— Select a scenario preset —</option>
        {scenarios.map((scenario) => {
          const evaluated = evaluatedIds[scenario.id];
          const tag = evaluated
            ? ` [Evaluated - ${evaluated.riskTier} Risk]`
            : '';
          return (
            <option key={scenario.id} value={scenario.id}>
              {scenario.label}
              {tag}
            </option>
          );
        })}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-[2.35rem] text-slate-400"
      />
    </label>
  );
}
