import { useMemo, useState } from 'react';
import { FileJson, FormInput, Loader2, Sparkles } from 'lucide-react';
import Card from '../../common/Card';
import Button from '../../common/Button';
import ScenarioSelector from './ScenarioSelector';
import ManualForm from './ManualForm';
import RawJsonInput from './RawJsonInput';
import ResultPanel from './ResultPanel';
import {
  emptyApplicationForm,
  scenarioToFormData,
  mockScenarios,
} from '../../../data/mockScenarios';
import { useFraudAnalysis } from '../../../hooks/useFraudAnalysis';
import { useAppContext } from '../../../context';

export default function Tab1Evaluation() {
  const { evaluatedIds } = useAppContext();
  const [selectedScenarioId, setSelectedScenarioId] = useState('');
  const [viewMode, setViewMode] = useState('form');
  const [formData, setFormData] = useState({ ...emptyApplicationForm });
  const [jsonError, setJsonError] = useState(null);
  const { analyze, loading, error, result } = useFraudAnalysis();

  const jsonText = useMemo(() => {
    try {
      return JSON.stringify(formData, null, 2);
    } catch {
      return '{}';
    }
  }, [formData]);

  const handleScenarioSelect = (id) => {
    setSelectedScenarioId(id);
    setJsonError(null);
    if (!id) {
      setFormData({ ...emptyApplicationForm });
      return;
    }
    const scenario = mockScenarios.find((s) => s.id === id);
    if (scenario) {
      setFormData(scenarioToFormData(scenario));
    }
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleJsonChange = (text) => {
    try {
      const parsed = JSON.parse(text);
      setFormData((prev) => ({
        ...prev,
        ...parsed,
      }));
      setJsonError(null);
    } catch {
      setJsonError('Invalid JSON — fix syntax to sync with form fields.');
    }
  };

  const handleAnalyze = async () => {
    if (!formData.applicantName) return;
    await analyze(formData);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <Card
        title="Scenario Preset"
        subtitle="Select a pre-loaded application to populate inputs, or craft a custom case."
      >
        <ScenarioSelector
          scenarios={mockScenarios}
          evaluatedIds={evaluatedIds}
          value={selectedScenarioId}
          onChange={handleScenarioSelect}
        />
      </Card>

      <Card
        title="Application Inputs"
        subtitle="Toggle between structured form fields and raw JSON. Both stay two-way synced."
        actions={
          <div className="flex rounded-lg bg-slate-800/80 p-1 ring-1 ring-slate-700/60">
            <button
              type="button"
              onClick={() => setViewMode('form')}
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
              onClick={() => setViewMode('json')}
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
          <ManualForm formData={formData} onChange={handleFormChange} />
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
            disabled={loading || !formData.applicantName || !!jsonError}
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
          {!formData.applicantName && !loading && (
            <p className="text-sm text-slate-500">
              Select a scenario or enter an applicant name to continue.
            </p>
          )}
        </div>
      </Card>

      <ResultPanel result={result} loading={loading} />
    </div>
  );
}
