import { Bot, User } from 'lucide-react';
import { formatDate } from '../../../utils/formatters';

function renderContent(content = '') {
  // Lightweight markdown-ish rendering for **bold** and newlines
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

export default function ChatThread({ messages = [], loading }) {
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
                'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                isUser ? 'bg-slate-700 text-slate-200' : 'bg-teal-500/20 text-teal-300',
              ].join(' ')}
            >
              {isUser ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-300">
                  {isUser ? 'You' : 'AI Assistant'}
                </span>
                <span>· {formatDate(msg.timestamp)}</span>
              </div>
              <div className="text-sm leading-relaxed text-slate-300">
                {renderContent(msg.content)}
              </div>
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
