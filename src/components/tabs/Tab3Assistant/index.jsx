import { useEffect, useMemo, useState } from 'react';
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
  const { applications } = useApplications();
  const {
    activeApplicationId,
    setActiveApplicationId,
    userRole,
  } = useAppContext();
  const [draft, setDraft] = useState('');
  const { messages, send, loading, error, reset } = useAssistantChat(
    activeApplicationId
  );

  useEffect(() => {
    reset();
  }, [activeApplicationId, reset]);

  const maskedApps = useMemo(
    () => applications.map((app) => maskApplication(app, userRole)),
    [applications, userRole]
  );

  const activeApp = useMemo(
    () => maskedApps.find((a) => a.id === activeApplicationId) || null,
    [maskedApps, activeApplicationId]
  );

  const handleSend = async (text) => {
    const prompt = (text ?? draft).trim();
    if (!prompt) return;
    setDraft('');
    await send(prompt);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <Card
        title="AI Fraud Assistant"
        subtitle="Triage and inspect flagged applications with guided prompts."
      >
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-sky-500/25 bg-sky-500/10 px-3.5 py-3 text-sm text-sky-100">
          <Info size={16} className="mt-0.5 shrink-0" />
          <p>
            ℹ️ Note: Choose the application ID you wish to triage or inspect with
            the AI Assistant.
          </p>
        </div>

        <TargetSelector
          applications={maskedApps}
          value={activeApplicationId}
          onChange={setActiveApplicationId}
        />

        {activeApp && (
          <p className="mt-3 text-sm text-slate-400">
            Active target:{' '}
            <span className="font-semibold text-slate-200">
              {activeApp.id} — {activeApp.applicantName}
            </span>{' '}
            · Risk {activeApp.riskTier} ({activeApp.riskScore})
          </p>
        )}
      </Card>

      <Card title="Quick Actions">
        <QuickActions
          disabled={loading || !activeApplicationId}
          onAction={handleSend}
        />
      </Card>

      <Card
        title="Chat Thread"
        subtitle="Conversation with the fraud analysis assistant"
      >
        <ChatThread messages={messages} loading={loading} />

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
            placeholder="Ask about risk drivers, income, or device signals…"
            className="min-w-[220px] flex-1 rounded-xl border border-slate-600/70 bg-slate-950/60 px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/25"
          />
          <Button type="submit" disabled={loading || !draft.trim()}>
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
