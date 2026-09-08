import { useState } from 'react';
import { ChevronDown, FileText, Smartphone, User } from 'lucide-react';
import { EMPLOYMENT_TYPES } from '../../../data/mockScenarios';
import BankStatementUploader from './BankStatementUploader';

const BASE_INPUT =
  'w-full rounded-xl border bg-slate-950/60 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition';
const INPUT_OK =
  'border-slate-600/70 focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/25';
const INPUT_ERR =
  'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/25';

function inputClass(hasError) {
  return [BASE_INPUT, hasError ? INPUT_ERR : INPUT_OK].join(' ');
}

function FieldLabel({ children, htmlFor }) {
  return (
    <span
      id={htmlFor ? `${htmlFor}-label` : undefined}
      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400"
    >
      {children}
    </span>
  );
}

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-xs text-red-500">
      {message}
    </p>
  );
}

function TextField({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  type = 'text',
  placeholder,
  min,
  max,
  autoCapitalize,
}) {
  const errorId = `${name}-error`;
  return (
    <label className="block">
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <input
        id={name}
        name={name}
        type={type}
        value={value ?? ''}
        min={min}
        max={max}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(e) => onChange(name, e.target.value)}
        onBlur={() => onBlur?.(name)}
        placeholder={placeholder}
        autoCapitalize={autoCapitalize}
        className={inputClass(error)}
      />
      <FieldError id={errorId} message={error} />
    </label>
  );
}

function ToggleField({ label, checked, onChange, description }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-600/70 bg-slate-950/60 px-3.5 py-2.5">
      <div>
        <p className="text-sm font-medium text-slate-100">{label}</p>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'relative h-6 w-11 shrink-0 rounded-full transition',
          checked ? 'bg-teal-500' : 'bg-slate-600',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition',
            checked ? 'left-5' : 'left-0.5',
          ].join(' ')}
        />
      </button>
    </div>
  );
}

function FormSection({ icon: Icon, title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-700/60 bg-slate-950/35">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-teal-300">
            <Icon size={16} />
          </span>
          <span className="text-sm font-semibold text-slate-100">{title}</span>
        </span>
        <ChevronDown
          size={16}
          className={['text-slate-400 transition-transform', open ? 'rotate-180' : ''].join(' ')}
        />
      </button>
      {open && <div className="grid gap-4 border-t border-slate-700/50 p-4 sm:grid-cols-2">{children}</div>}
    </section>
  );
}

export default function ManualForm({
  formData,
  errors = {},
  onChange,
  onBlur,
  onPdfSelected,
  onPdfClear,
}) {
  const err = (field) => errors[field] || '';

  return (
    <div className="space-y-3">
      <FormSection icon={User} title="Applicant & Financial Profile">
        <TextField
          name="applicantName"
          label="Applicant Name"
          value={formData.applicantName}
          onChange={onChange}
          onBlur={onBlur}
          error={err('applicantName')}
          placeholder="e.g. Rahul Sharma"
        />
        <TextField
          name="panNumber"
          label="PAN Number"
          value={formData.panNumber}
          onChange={onChange}
          onBlur={onBlur}
          error={err('panNumber')}
          placeholder="ABCDE1234F"
          autoCapitalize="characters"
        />
        <TextField
          name="phoneNumber"
          label="Phone Number"
          value={formData.phoneNumber}
          onChange={onChange}
          onBlur={onBlur}
          error={err('phoneNumber')}
          placeholder="+91 98765 43210"
        />
        <TextField
          name="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={onChange}
          onBlur={onBlur}
          error={err('email')}
          placeholder="rahul.sharma88@gmail.com"
        />
        <label className="block">
          <FieldLabel htmlFor="employmentType">Employment Type</FieldLabel>
          <select
            id="employmentType"
            name="employmentType"
            value={formData.employmentType || 'Salaried'}
            onChange={(e) => onChange('employmentType', e.target.value)}
            onBlur={() => onBlur?.('employmentType')}
            className={inputClass(err('employmentType'))}
            aria-invalid={Boolean(err('employmentType'))}
          >
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <FieldError id="employmentType-error" message={err('employmentType')} />
        </label>
        <TextField
          name="companyName"
          label="Company Name"
          value={formData.companyName}
          onChange={onChange}
          onBlur={onBlur}
          error={err('companyName')}
          placeholder="TechSolutions Pvt Ltd"
        />
        <TextField
          name="declaredIncome"
          label="Declared Income (₹ annual)"
          type="number"
          min={10000}
          max={100000000}
          value={formData.declaredIncome}
          onChange={onChange}
          onBlur={onBlur}
          error={err('declaredIncome')}
          placeholder="1800000"
        />
        <label className="block sm:col-span-2">
          <FieldLabel htmlFor="declaredAddress">Declared Address</FieldLabel>
          <textarea
            id="declaredAddress"
            name="declaredAddress"
            rows={2}
            value={formData.declaredAddress ?? ''}
            onChange={(e) => onChange('declaredAddress', e.target.value)}
            onBlur={() => onBlur?.('declaredAddress')}
            placeholder="Street, city, state, PIN"
            className={inputClass(err('declaredAddress'))}
            aria-invalid={Boolean(err('declaredAddress'))}
          />
          <FieldError id="declaredAddress-error" message={err('declaredAddress')} />
        </label>
        <TextField
          name="applicationTimestamp"
          label="Application Timestamp"
          type="datetime-local"
          value={formData.applicationTimestamp}
          onChange={onChange}
          onBlur={onBlur}
          error={err('applicationTimestamp')}
        />
      </FormSection>

      <FormSection icon={Smartphone} title="Device & Network Telemetry">
        <TextField
          name="deviceId"
          label="Device ID"
          value={formData.deviceId}
          onChange={onChange}
          onBlur={onBlur}
          error={err('deviceId')}
          placeholder="DEV-39482-PUN"
        />
        <TextField
          name="ipAddress"
          label="IP Address"
          value={formData.ipAddress}
          onChange={onChange}
          onBlur={onBlur}
          error={err('ipAddress')}
          placeholder="103.22.140.12"
        />
        <TextField
          name="ipLocation"
          label="IP Location"
          value={formData.ipLocation}
          onChange={onChange}
          onBlur={onBlur}
          error={err('ipLocation')}
          placeholder="Pune, MH"
        />
        <TextField
          name="deviceReuseCount"
          label="Reported Device Reuse (optional)"
          type="number"
          min={0}
          max={50}
          value={formData.deviceReuseCount}
          onChange={onChange}
          onBlur={onBlur}
          error={err('deviceReuseCount')}
          placeholder="Server recomputes from stored apps"
        />
        <div className="sm:col-span-2">
          <ToggleField
            label="VPN / Proxy Active"
            description="Whether the request originated from a VPN or proxy"
            checked={Boolean(formData.isVpnOrProxy)}
            onChange={(v) => onChange('isVpnOrProxy', v)}
          />
        </div>
      </FormSection>

      <FormSection icon={FileText} title="Financials & Bank Statement">
        <BankStatementUploader
          formData={formData}
          errors={errors}
          onChange={onChange}
          onBlur={onBlur}
          onFileSelected={onPdfSelected}
          onClearFile={onPdfClear}
        />
      </FormSection>
    </div>
  );
}
