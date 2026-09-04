import { useMemo, useState } from 'react';
import { ArrowRight, Filter, Search } from 'lucide-react';
import Card from '../../common/Card';
import Button from '../../common/Button';
import Badge from '../../common/Badge';
import RiskBadge from '../../common/RiskBadge';
import ApplicationTable from './ApplicationTable';
import PiiMaskingControls from './PiiMaskingControls';
import { useApplications } from '../../../hooks/useApplications';
import { useAppContext } from '../../../context';
import { maskApplication } from '../../../utils/piiMasker';
import {
  formatCurrency,
  getStatusClasses,
  getStatusLabel,
} from '../../../utils/formatters';

export default function Tab2FraudLog() {
  const { applications, loading } = useApplications();
  const { userRole, navigateToAssistant, evaluatedIds } = useAppContext();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [forceMask, setForceMask] = useState(false);

  const effectiveRole =
    forceMask || userRole === 'GUEST' ? 'GUEST' : 'ANALYST';

  const rows = useMemo(() => {
    return applications
      .map((app) => {
        const evaluated = evaluatedIds[app.id];
        return {
          ...app,
          riskScore: evaluated?.riskScore ?? app.riskScore,
          riskTier: evaluated?.riskTier ?? app.riskTier,
          status: evaluated ? app.status || 'EVALUATED' : app.status,
        };
      })
      .filter((app) => {
        if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          app.id?.toLowerCase().includes(q) ||
          app.applicantName?.toLowerCase().includes(q)
        );
      })
      .map((app) => maskApplication(app, effectiveRole));
  }, [applications, evaluatedIds, query, statusFilter, effectiveRole]);

  return (
    <div className="space-y-5 animate-fade-in">
      <Card
        title="Fraud Application Log"
        subtitle="Filterable triage table with RBAC-aware PII masking."
        actions={
          <PiiMaskingControls
            userRole={userRole}
            forceMask={forceMask}
            onForceMaskChange={setForceMask}
          />
        }
      >
        <div className="mb-4 flex flex-wrap gap-3">
          <label className="relative min-w-[220px] flex-1">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by App ID or applicant…"
              className="w-full rounded-xl border border-slate-600/70 bg-slate-950/60 py-2.5 pl-9 pr-3 text-sm text-slate-100 outline-none focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/25"
            />
          </label>
          <label className="relative">
            <Filter
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none rounded-xl border border-slate-600/70 bg-slate-950/60 py-2.5 pl-9 pr-8 text-sm text-slate-100 outline-none focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/25"
            >
              <option value="ALL">All Statuses</option>
              <option value="FLAGGED">Flagged</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="CLEARED">Cleared</option>
            </select>
          </label>
        </div>

        <ApplicationTable
          rows={rows}
          loading={loading}
          formatCurrency={formatCurrency}
          getStatusClasses={getStatusClasses}
          getStatusLabel={getStatusLabel}
          RiskBadge={RiskBadge}
          Badge={Badge}
          onInvestigate={navigateToAssistant}
          Button={Button}
          ArrowRight={ArrowRight}
        />
      </Card>
    </div>
  );
}
