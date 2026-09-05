import { useMemo, useState } from 'react';
import { Info, Loader2, Send } from 'lucide-react';
import Card from '../../common/Card';
import Button from '../../common/Button';
import TargetSelector from './TargetSelector';
import QuickActions from './QuickActions';
import ChatThread from './ChatThread';
import { useApplications } from '../../../hooks/useApplications';
import { useAssistantChat } from '../../../hooks/useFraudAnalysis';
import { useAppContext } from '../../../context';
import { maskApplication } from '../../../utils/piiMasker';

export default function Tab3Assistant() {
  const { applications, loading: appsLoading, error: appsError } = useApplications();
  const {
    activeApplicationId,
    setActiveApplicationId,
    userRole,
  } = useAppContext();
  const [draft, setDraft] = useState('');
  const { messages, send, loading, historyLoading, error } = useAssistantChat(
    activeApplicationId
  );

  const maskedApps = useMemo(
    () => applications.map((app) => maskApplication(app, userRole)),
    [applications, userRole]
  );

  const activeApp = useMemo(
    () =>
      maskedApps.find(
        (a) => a.id === activeApplicationId || a.applicationId === activeApplicationId
      ) || null,
    [maskedApps, activeApplicationId]
  );

  const isAnalyst = userRole === 'ANALYST';
  const canChat =
    Boolean(activeApplicationId) && isAnalyst && !loading && !historyLoading;

  const handleSend = async (text) => {
    const prompt = (text ?? draft).trim();
    if (!prompt || !activeApplicationId || !isAnalyst) return;
    setDraft('');
    await send(prompt);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <Card
        title="AI Fraud Assistant"
        subtitle="Questions go to POST /api/v1/applications/:id/chat with that application's evaluation context."
      >
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-sky-500/25 bg-sky-500/10 px-3.5 py-3 text-sm text-sky-100">
          <Info size={16} className="mt-0.5 shrink-0" />
          <p>
            Choose an evaluated application, then ask about risk, income, or
            device signals. The assistant only answers using that record.
            Sending messages requires the Analyst role.
          </p>
        </div>

        {appsLoading && (
          <p className="mb-3 text-xs text-slate-500">Loading applications…</p>
        )}
        {appsError && (
          <p className="mb-3 text-sm text-rose-300">{appsError}</p>
        )}
        {!appsLoading && !applications.length && (
          <p className="mb-3 text-sm text-slate-400">
            No evaluated applications yet. Run an evaluation in Risk Triage first.
          </p>
        )}

        <TargetSelector
          applications={maskedApps}
          value={activeApplicationId}
          onChange={setActiveApplicationId}
        />

        {activeApp && (
          <p className="mt-3 text-sm text-slate-400">
            Active target:{' '}
            <span className="font-semibold text-slate-200">
              {activeApp.applicationId || activeApp.id} — {activeApp.applicantName}
            </span>{' '}
            · Risk {activeApp.riskTier} ({activeApp.riskScore})
          </p>
        )}
        {activeApp && !isAnalyst && (
          <p className="mt-3 text-sm text-amber-300">
            Guest role can view this application but cannot send chat messages.
          </p>
        )}
      </Card>

      <Card title="Quick Actions">
        <QuickActions
          disabled={!canChat}
          onAction={handleSend}
        />
      </Card>

      <Card
        title="Chat Thread"
        subtitle={
          activeApplicationId
            ? 'Live assistant replies for the selected application'
            : 'Select an application to start a conversation'
        }
      >
        {historyLoading && (
          <p className="mb-3 flex items-center gap-2 text-sm text-slate-400">
            <Loader2 size={14} className="animate-spin text-teal-400" />
            Loading conversation history…
          </p>
        )}

        <ChatThread
          messages={messages}
          loading={loading}
          onAction={handleSend}
          actionsDisabled={!canChat}
        />

        <form
          className="mt-4 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={!activeApplicationId || loading}
            placeholder={
              activeApplicationId
                ? 'Ask about risk drivers, income, or device signals…'
                : 'Select an application first…'
            }
            className="min-w-[220px] flex-1 rounded-xl border border-slate-600/70 bg-slate-950/60 px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/25 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button
            type="submit"
            disabled={!canChat || !draft.trim()}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            Send
          </Button>
        </form>
        {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}
      </Card>
    </div>
  );
}
