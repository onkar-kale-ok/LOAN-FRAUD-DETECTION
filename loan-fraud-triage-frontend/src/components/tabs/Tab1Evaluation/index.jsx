import { useEffect, useMemo, useState } from 'react';
import { FileJson, FormInput, Loader2, Sparkles } from 'lucide-react';
import Card from '../../common/Card';
import Button from '../../common/Button';
import ScenarioSelector from './ScenarioSelector';
import ManualForm from './ManualForm';
import RawJsonInput from './RawJsonInput';
import ResultPanel from './ResultPanel';
import {
  emptyApplicationForm,
  emptyBankStatementFields,
  serializeFormForJson,
} from '../../../data/mockScenarios';
import {
  hasValidationErrors,
  reconcileFieldError,
  validateField,
  validateForm,
} from '../../../utils/formValidation';
import { getScenarios } from '../../../services/fraudService';
import { useFraudAnalysis } from '../../../hooks/useFraudAnalysis';
import { useAppContext } from '../../../context';

function toJsonText(data) {
  try {
    return JSON.stringify(serializeFormForJson(data), null, 2);
  } catch {
    return '{}';
  }
}

function apiScenarioToFormData(scenario) {
  const payload = scenario?.payload || {};
  const applicant = payload.applicant || {};
  const financials = payload.financials || {};
  const telemetry = payload.telemetry || {};
  const documentOcr = payload.documentOcr || {};

  return {
    ...emptyApplicationForm,
    ...emptyBankStatementFields,
    applicantName: applicant.name || '',
    companyName: applicant.companyName || '',
    panNumber: applicant.panNumber || '',
    phoneNumber: applicant.phone || '',
    email: applicant.email || '',
    declaredIncome: financials.declaredIncome ?? '',
    ocrBankIncome: financials.ocrBankIncome ?? '',
    deviceId: telemetry.deviceId || '',
    ipAddress: telemetry.ipAddress || '',
    ipLocation: telemetry.ipLocation || '',
    deviceReuseCount: telemetry.deviceReuseCount ?? '',
    isVpnOrProxy: /vpn|proxy/i.test(String(telemetry.ipLocation || '')),
    addressMatchScore: documentOcr.addressMatchScore ?? '',
    documentTamperFlag: Boolean(documentOcr.documentTamperFlag),
    bankStatementFileName: documentOcr.uploadedBankStatement || '',
    bankStatementFileSize: '',
    bankStatementParsed: Boolean(documentOcr.uploadedBankStatement),
    bankStatementMock: Boolean(documentOcr.uploadedBankStatement),
  };
}

export default function Tab1Evaluation() {
  const { evaluatedIds } = useAppContext();
  const [selectedScenarioId, setSelectedScenarioId] = useState('');
  const [viewMode, setViewMode] = useState('form');
  const [formData, setFormData] = useState({ ...emptyApplicationForm });
  const [jsonDraft, setJsonDraft] = useState(() => toJsonText(emptyApplicationForm));
  const [jsonError, setJsonError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [bankStatementFile, setBankStatementFile] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [scenariosLoading, setScenariosLoading] = useState(true);
  const [scenariosError, setScenariosError] = useState(null);
  const { analyze, loading, error, result } = useFraudAnalysis();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setScenariosLoading(true);
      setScenariosError(null);
      try {
        const response = await getScenarios();
        const list = Array.isArray(response?.data) ? response.data : [];
        if (!cancelled) setScenarios(list);
      } catch (err) {
        if (!cancelled) {
          setScenarios([]);
          setScenariosError(
            err.message || 'Unable to load scenarios from the API.'
          );
        }
      } finally {
        if (!cancelled) setScenariosLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const applyFormPatch = (patch) => {
    setFormData((prev) => {
      const next = { ...prev, ...patch };
      setJsonDraft(toJsonText(next));
      return next;
    });
  };

  const jsonText = useMemo(() => {
    if (viewMode === 'json') return jsonDraft;
    return toJsonText(formData);
  }, [viewMode, jsonDraft, formData]);

  const applyFormData = (next) => {
    setFormData(next);
    setJsonDraft(toJsonText(next));
  };

  const handleScenarioSelect = (id) => {
    setSelectedScenarioId(id);
    setJsonError(null);
    setFieldErrors({});
    setSubmitAttempted(false);
    setBankStatementFile(null);
    if (!id) {
      applyFormData({ ...emptyApplicationForm, ...emptyBankStatementFields });
      return;
    }
    const scenario = scenarios.find((s) => s.scenarioId === id);
    if (scenario) {
      applyFormData(apiScenarioToFormData(scenario));
    }
  };

  const handlePdfSelected = (file) => {
    setBankStatementFile(file);
    applyFormPatch({
      bankStatementFileName: file.name,
      bankStatementFileSize: file.size,
      bankStatementParsed: true,
      bankStatementMock: false,
    });
  };

  const handlePdfClear = () => {
    setBankStatementFile(null);
    applyFormPatch({ ...emptyBankStatementFields });
  };

  const handleFormChange = (field, value) => {
    const nextValue = field === 'panNumber' ? String(value).toUpperCase() : value;
    setFormData((prev) => {
      const next = { ...prev, [field]: nextValue };
      setJsonDraft(toJsonText(next));
      setFieldErrors((errs) => reconcileFieldError(errs, field, next));
      return next;
    });
  };

  const handleFormBlur = (field) => {
    setFormData((prev) => {
      const message = validateField(field, prev[field], prev);
      setFieldErrors((errs) => {
        const next = { ...errs };
        if (message) next[field] = message;
        else delete next[field];
        return next;
      });
      return prev;
    });
  };

  const handleJsonChange = (text) => {
    setJsonDraft(text);
    try {
      const parsed = JSON.parse(text);
      const { applicationId: _omitId, id: _omitLegacyId, ...rest } = parsed;
      setFormData((prev) => ({
        ...prev,
        ...rest,
        panNumber: String(rest.panNumber ?? rest.pan ?? prev.panNumber ?? '').toUpperCase(),
      }));
      setJsonError(null);
    } catch {
      setJsonError('Invalid JSON — fix syntax to sync with form fields.');
    }
  };

  const handleViewMode = (mode) => {
    if (mode === 'json') {
      const text = toJsonText(formData);
      setJsonDraft(text);
      try {
        JSON.parse(text);
        setJsonError(null);
      } catch {
        setJsonError('Invalid JSON — fix syntax to sync with form fields.');
      }
    } else {
      setJsonError(null);
    }
    setViewMode(mode);
  };

  const handleAnalyze = async () => {
    setSubmitAttempted(true);
    if (jsonError) return;
    const errors = validateForm(formData);
    setFieldErrors(errors);
    if (hasValidationErrors(errors)) {
      if (viewMode === 'json') setViewMode('form');
      return;
    }
    await analyze(formData, bankStatementFile);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <Card
        title="Scenario Preset"
        subtitle="Select a pre-loaded application to populate inputs, or craft a custom case."
      >
        <ScenarioSelector
          scenarios={scenarios}
          evaluatedIds={evaluatedIds}
          value={selectedScenarioId}
          onChange={handleScenarioSelect}
          disabled={scenariosLoading}
        />
        {scenariosLoading && (
          <p className="mt-2 text-xs text-slate-500">Loading scenario presets…</p>
        )}
        {scenariosError && (
          <p className="mt-2 text-xs text-red-400">{scenariosError}</p>
        )}
      </Card>

      <Card
        title="Application Inputs"
        subtitle="Toggle between structured form fields and raw JSON. Both stay two-way synced."
        actions={
          <div className="flex rounded-lg bg-slate-800/80 p-1 ring-1 ring-slate-700/60">
            <button
              type="button"
              onClick={() => handleViewMode('form')}
              className={[
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition',
                viewMode === 'form'
                  ? 'bg-slate-700 text-teal-300'
                  : 'text-slate-400 hover:text-slate-200',
              ].join(' ')}
            >
              <FormInput size={14} />
              Form View
            </button>
            <button
              type="button"
              onClick={() => handleViewMode('json')}
              className={[
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition',
                viewMode === 'json'
                  ? 'bg-slate-700 text-teal-300'
                  : 'text-slate-400 hover:text-slate-200',
              ].join(' ')}
            >
              <FileJson size={14} />
              Raw JSON
            </button>
          </div>
        }
      >
        {viewMode === 'form' ? (
          <ManualForm
            formData={formData}
            errors={fieldErrors}
            onChange={handleFormChange}
            onBlur={handleFormBlur}
            onPdfSelected={handlePdfSelected}
            onPdfClear={handlePdfClear}
          />
        ) : (
          <RawJsonInput
            value={jsonText}
            onChange={handleJsonChange}
            error={jsonError}
          />
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            onClick={handleAnalyze}
            disabled={loading || !!jsonError}
            size="lg"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            Run AI Fraud Evaluation
          </Button>
          {error && <p className="text-sm text-rose-300">{error}</p>}
          {jsonError && (
            <p className="text-sm text-red-500">
              Fix the JSON syntax error before running evaluation.
            </p>
          )}
          {submitAttempted && hasValidationErrors(fieldErrors) && !jsonError && (
            <p className="text-sm text-red-500">
              Please correct the highlighted fields before running evaluation.
            </p>
          )}
        </div>
      </Card>

      <ResultPanel result={result} loading={loading} />
    </div>
  );
}
