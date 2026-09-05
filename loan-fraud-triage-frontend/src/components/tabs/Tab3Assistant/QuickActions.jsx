const ACTIONS = [
  { id: 'why-high', label: '⚡ Why is this High Risk?', prompt: 'Why is this High Risk?' },
  { id: 'income', label: '⚡ Show income discrepancy', prompt: 'Show income discrepancy' },
  { id: 'device', label: '⚡ List device anomalies', prompt: 'List device anomalies' },
];

export default function QuickActions({ onAction, disabled }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.map((action) => (
        <button
          key={action.id}
          type="button"
          disabled={disabled}
          onClick={() => onAction(action.prompt)}
          className="rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-2 text-xs font-semibold text-teal-200 transition hover:border-teal-400/50 hover:bg-teal-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
