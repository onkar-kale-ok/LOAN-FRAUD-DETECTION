import { ChevronDown } from 'lucide-react';

export default function TargetSelector({ applications = [], value, onChange }) {
  return (
    <label className="relative block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
        Target Application
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-slate-600/70 bg-slate-950/60 py-3 pl-4 pr-10 text-sm text-slate-100 outline-none transition focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/25"
      >
        {applications.map((app) => (
          <option key={app.id} value={app.id}>
            {app.id} — {app.applicantName} ({app.riskTier || 'N/A'})
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-[2.35rem] text-slate-400"
      />
    </label>
  );
}
