import { Eye, EyeOff } from 'lucide-react';
import { useAppContext } from '../../context';

export default function RbacBanner() {
  const { userRole } = useAppContext();
  const isGuest = userRole === 'GUEST';

  return (
    <div
      className={[
        'border-b px-4 py-2.5 text-sm sm:px-6 lg:px-8',
        isGuest
          ? 'border-amber-500/20 bg-amber-500/10 text-amber-200'
          : 'border-teal-500/20 bg-teal-500/10 text-teal-200',
      ].join(' ')}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-2">
        {isGuest ? <EyeOff size={16} /> : <Eye size={16} />}
        <p>
          {isGuest
            ? 'Guest mode — identifiers are masked in this UI. Saving a decision or sending chat is blocked by the API.'
            : 'Analyst mode — full identifiers in this UI. Decision and chat calls are allowed.'}
        </p>
      </div>
    </div>
  );
}
