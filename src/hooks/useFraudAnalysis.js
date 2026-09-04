import { useCallback, useState } from 'react';
import { analyzeApplication, sendAssistantQuery } from '../services/fraudService';
import { useAppContext } from '../context';

export function useFraudAnalysis() {
  const { markEvaluated } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const analyze = useCallback(
    async (formData) => {
      setLoading(true);
      setError(null);
      try {
        const payload = {
          ...formData,
          declaredIncome: Number(formData.declaredIncome),
          ocrIncome: Number(formData.ocrIncome),
        };
        const data = await analyzeApplication(payload);
        const enriched = {
          ...data,
          declaredIncome: payload.declaredIncome,
          ocrIncome: payload.ocrIncome,
          deviceId: payload.deviceId,
          ipAddress: payload.ipAddress,
        };
        setResult(enriched);
        markEvaluated(payload.id || enriched.applicationId, enriched);
        return enriched;
      } catch (err) {
        setError(err.message || 'Analysis failed');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [markEvaluated]
  );

  return { analyze, loading, error, result, setResult };
}

export function useAssistantChat(applicationId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const send = useCallback(
    async (prompt) => {
      if (!prompt?.trim() || !applicationId) return;
      const userMsg = {
        role: 'user',
        content: prompt.trim(),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);
      setError(null);
      try {
        const reply = await sendAssistantQuery(applicationId, prompt.trim());
        setMessages((prev) => [...prev, reply]);
        return reply;
      } catch (err) {
        setError(err.message || 'Chat request failed');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [applicationId]
  );

  const reset = useCallback(() => setMessages([]), []);

  return { messages, send, loading, error, reset, setMessages };
}

export default useFraudAnalysis;
