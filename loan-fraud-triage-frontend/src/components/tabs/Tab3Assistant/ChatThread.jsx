import { Bot, User } from 'lucide-react';
import { formatTime } from '../../../utils/formatters';

const RESPONSE_CHIPS = [
  {
    id: 'rejection',
    label: '⚡ Draft Formal Rejection Letter',
    prompt: 'Draft Formal Rejection Letter',
  },
  {
    id: 'graph',
    label: '⚡ Show Device Network Graph',
    prompt: 'Show Device Network Graph',
  },
];

function renderContent(content = '') {
  const parts = String(content).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return (
      <span key={idx}>
        {part.split('\n').map((line, lineIdx, arr) => (
          <span key={`${idx}-${lineIdx}`}>
            {line}
            {lineIdx < arr.length - 1 && <br />}
          </span>
        ))}
      </span>
    );
  });
}

export default function ChatThread({ messages = [], loading, onAction, actionsDisabled }) {
  if (!messages.length && !loading) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700/70 bg-slate-950/40 px-4 py-10 text-center text-sm text-slate-500">
        No messages yet. Use a quick action or ask a free-form question about the
        selected application.
      </div>
    );
  }

  return (
    <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto pr-1">
      {messages.map((msg, idx) => {
        const isUser = msg.role === 'user';
        return (
          <div
            key={`${msg.timestamp}-${idx}`}
            className={[
              'flex gap-3 rounded-xl px-3.5 py-3',
              isUser
                ? 'bg-slate-800/60'
                : 'border border-teal-500/15 bg-teal-500/5',
            ].join(' ')}
          >
            <div
              className={[
                'mt-0.5 flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-full text-[10px] font-bold',
                isUser
                  ? 'bg-indigo-500/25 text-indigo-200 ring-1 ring-indigo-400/40'
                  : 'bg-teal-500/20 text-teal-200 ring-1 ring-teal-400/40',
              ].join(' ')}
              aria-label={isUser ? 'Analyst' : 'AI Assistant'}
            >
              {isUser ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
                <span
                  className={[
                    'rounded-md px-1.5 py-0.5 font-semibold',
                    isUser
                      ? 'bg-indigo-500/15 text-indigo-200'
                      : 'bg-teal-500/15 text-teal-200',
                  ].join(' ')}
                >
                  {isUser ? 'Analyst' : 'AI Assistant'}
                </span>
                <span className="text-slate-500">{formatTime(msg.timestamp)}</span>
              </div>
              <div className="text-sm leading-relaxed text-slate-300">
                {renderContent(msg.content)}
              </div>
              {!isUser && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {RESPONSE_CHIPS.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      disabled={actionsDisabled}
                      onClick={() => onAction?.(chip.prompt)}
                      className="rounded-full border border-teal-500/30 bg-slate-950/50 px-3 py-1.5 text-[11px] font-semibold text-teal-200 transition hover:border-teal-400/50 hover:bg-teal-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
      {loading && (
        <div className="flex items-center gap-2 px-2 text-sm text-teal-300">
          <span className="inline-flex gap-1">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </span>
          Assistant is analyzing…
        </div>
      )}
    </div>
  );
}
