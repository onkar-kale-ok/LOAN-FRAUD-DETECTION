import { Shield } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-slate-700/50 bg-slate-950/50 p-4 lg:block">
      <div className="mb-6 flex items-center gap-2 text-slate-300">
        <Shield size={16} className="text-teal-400" />
        <span className="text-xs font-semibold uppercase tracking-widest">
          Workspace
        </span>
      </div>
      <ul className="space-y-2 text-sm text-slate-400">
        <li className="rounded-lg bg-slate-800/60 px-3 py-2 text-slate-200">
          Risk Triage
        </li>
        <li className="px-3 py-2 opacity-60">Case Queue</li>
        <li className="px-3 py-2 opacity-60">Model Insights</li>
        <li className="px-3 py-2 opacity-60">Audit Trail</li>
      </ul>
    </aside>
  );
}
