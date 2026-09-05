import { ShieldAlert, ChevronDown } from 'lucide-react';
import { useAppContext } from '../../context';
import Badge from '../common/Badge';

export default function Header() {
  const { userRole, setUserRole, roles } = useAppContext();
  const roleMeta = roles[userRole];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-700/60 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 shadow-lg shadow-teal-500/25">
            <ShieldAlert className="text-slate-950" size={22} strokeWidth={2.25} />
          </div>
          <div className="min-w-0">
            <p className="font-display text-lg font-bold tracking-tight text-slate-50 sm:text-xl">
              AI Fraud Detection &amp; Risk Triage Engine
            </p>
            <p className="truncate text-xs text-slate-400 sm:text-sm">
              Loan application risk scoring · Guest UI masking; Analyst for decide/chat
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="hidden bg-slate-800/80 text-slate-300 ring-1 ring-slate-600/50 sm:inline-flex">
            {roleMeta.description}
          </Badge>
          <label className="relative block">
            <span className="sr-only">Role selector</span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="appearance-none rounded-lg border border-slate-600/70 bg-slate-900 py-2 pl-3 pr-9 text-sm font-semibold text-slate-100 outline-none transition focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/30"
            >
              <option value="ANALYST">ANALYST (Full Access)</option>
              <option value="GUEST">GUEST (Auditor — Masked)</option>
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </label>
        </div>
      </div>
    </header>
  );
}
