import { formatCurrency } from '../../../utils/formatters';

function varianceStatus(flagged, text) {
  return flagged
    ? { text, className: 'text-red-400' }
    : { text, className: 'text-emerald-300' };
}

export function buildComparisonRows(result = {}) {
  const declared = Number(result.declaredIncome) || 0;
  const ocr = Number(result.ocrBankIncome ?? result.ocrIncome) || 0;
  const delta = declared - ocr;
  const pct = ocr > 0 ? Math.round((delta / ocr) * 100) : declared > 0 ? 100 : 0;
  const incomeFlagged = Math.abs(pct) > 25;
  const incomeText =
    ocr || declared
      ? `${pct > 0 ? '+' : ''}${pct}% · ${formatCurrency(delta)}`
      : '—';

  const addressScore = Number(result.addressMatchScore);
  const addressFlagged = Number.isFinite(addressScore) && addressScore < 75;
  const addressText = Number.isFinite(addressScore)
    ? `${addressScore}% match${addressFlagged ? ' · Flagged' : ' · Clear'}`
    : '—';

  const tampered = Boolean(result.documentTamperFlag);
  const metadata = result.suspiciousMetadata
    ? ` · ${result.suspiciousMetadata}`
    : '';

  return [
    {
      field: 'Annual Income',
      declared: formatCurrency(result.declaredIncome),
      ocr: formatCurrency(result.ocrBankIncome ?? result.ocrIncome),
      variance: varianceStatus(
        incomeFlagged,
        incomeFlagged ? `${incomeText} · Flagged` : `${incomeText} · Clear`
      ),
    },
    {
      field: 'Address / Location',
      declared: result.ipLocation || '—',
      ocr: result.ocrExtractedAddress || '—',
      variance: varianceStatus(addressFlagged, addressText),
    },
    {
      field: 'Document Integrity',
      declared: result.bankStatementFileName || 'Statement claimed',
      ocr: tampered ? 'Tampering detected' : result.bankStatementParsed ? 'OCR clean' : 'Not parsed',
      variance: varianceStatus(
        tampered,
        tampered ? `Tampered ⚠️${metadata}` : 'Clear'
      ),
    },
  ];
}

export default function ComparisonTable({ result }) {
  const rows = buildComparisonRows(result);

  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Declared vs. OCR Comparison
      </h4>
      <div className="overflow-x-auto rounded-xl border border-slate-700/50">
        <table className="min-w-full divide-y divide-slate-700/50 text-left text-sm">
          <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-3 py-2.5 font-semibold">Field Name</th>
              <th className="px-3 py-2.5 font-semibold">Declared Value</th>
              <th className="px-3 py-2.5 font-semibold">OCR Verified Value</th>
              <th className="px-3 py-2.5 font-semibold">Variance / Flag Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {rows.map((row) => (
              <tr key={row.field} className="bg-slate-900/30">
                <td className="whitespace-nowrap px-3 py-2.5 font-medium text-slate-100">
                  {row.field}
                </td>
                <td className="px-3 py-2.5 text-slate-300">{row.declared}</td>
                <td className="px-3 py-2.5 text-slate-300">{row.ocr}</td>
                <td className={`px-3 py-2.5 text-xs font-semibold ${row.variance.className}`}>
                  {row.variance.text}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
