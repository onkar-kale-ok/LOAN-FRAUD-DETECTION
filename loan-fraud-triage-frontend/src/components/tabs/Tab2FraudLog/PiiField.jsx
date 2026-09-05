import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { maskPan, maskPhone } from '../../../utils/piiMasker';

export default function PiiField({ value, kind = 'pan', canUnmask = false }) {
  const [revealed, setRevealed] = useState(false);
  const raw = value || '—';
  const masked = kind === 'phone' ? maskPhone(value) : maskPan(value);
  const display = canUnmask ? (revealed ? raw : masked) : raw;

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-300">
      <span>{display}</span>
      {canUnmask && raw !== '—' && (
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          className="rounded p-0.5 text-slate-500 transition hover:bg-slate-800 hover:text-teal-300"
          aria-label={revealed ? `Hide ${kind}` : `Reveal ${kind}`}
          title={revealed ? 'Hide identifier' : 'Reveal identifier'}
        >
          {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      )}
    </span>
  );
}
