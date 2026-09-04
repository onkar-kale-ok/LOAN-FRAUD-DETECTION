import Badge from './Badge';
import { getRiskColorClasses } from '../../utils/formatters';

export default function RiskBadge({ score, tier, showScore = true }) {
  const colors = getRiskColorClasses(tier || score);
  return (
    <Badge className={colors.badge}>
      <span className={`h-1.5 w-1.5 rounded-full ${colors.bar}`} />
      {colors.tier}
      {showScore && score != null && (
        <span className="opacity-80">· {score}</span>
      )}
    </Badge>
  );
}
