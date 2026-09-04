const FIELDS = [
  { key: 'applicantName', label: 'Applicant Name', type: 'text', placeholder: 'e.g. Rahul Sharma' },
  { key: 'declaredIncome', label: 'Declared Income (₹)', type: 'number', placeholder: '1850000' },
  { key: 'ocrIncome', label: 'OCR Income (₹)', type: 'number', placeholder: '620000' },
  { key: 'deviceId', label: 'Device ID', type: 'text', placeholder: 'DEV-RING-8842-A7' },
  { key: 'ipAddress', label: 'IP Address', type: 'text', placeholder: '103.211.45.92' },
];

export default function ManualForm({ formData, onChange }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {FIELDS.map((field) => (
        <label key={field.key} className="block sm:col-span-1">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
            {field.label}
          </span>
          <input
            type={field.type}
            value={formData[field.key] ?? ''}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="w-full rounded-xl border border-slate-600/70 bg-slate-950/60 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/25"
          />
        </label>
      ))}
      {formData.id && (
        <div className="sm:col-span-2">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Application ID
          </span>
          <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 px-3.5 py-2.5 font-mono text-sm text-teal-300">
            {formData.id}
          </div>
        </div>
      )}
    </div>
  );
}
