import { ClipboardCheck, Table2, Bot, Share2 } from 'lucide-react';
import { useAppContext } from '../../context';

const TABS = [
  { id: 'evaluation', label: 'New Evaluation', icon: ClipboardCheck },
  { id: 'fraudLog', label: 'Fraud Log', icon: Table2 },
  { id: 'network', label: 'Network', icon: Share2 },
  { id: 'assistant', label: 'AI Assistant', icon: Bot },
];

export default function Navbar() {
  const { activeTab, setActiveTab } = useAppContext();

  return (
    <nav className="border-b border-slate-700/50 bg-slate-950/40">
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={[
                'relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors',
                active
                  ? 'text-teal-300'
                  : 'text-slate-400 hover:text-slate-200',
              ].join(' ')}
            >
              <Icon size={16} />
              {label}
              {active && (
                <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-teal-400 tab-indicator" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
