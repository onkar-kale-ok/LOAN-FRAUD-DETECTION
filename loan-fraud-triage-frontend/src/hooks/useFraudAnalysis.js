import { useCallback, useEffect, useState } from 'react';
import {
  getChatHistory,
  sendAssistantQuery,
  submitEvaluation,
} from '../services/fraudService';
import { useAppContext } from '../context';

export function useFraudAnalysis() {
  const { markEvaluated } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const analyze = useCallback(
    async (formData, bankStatementFile) => {
      setLoading(true);
      setError(null);
      try {
        const evaluationResult = await submitEvaluation(formData, bankStatementFile);
        const enriched = {
          ...formData,
          ...evaluationResult,
          applicationId: evaluationResult.applicationId,
          analyzedAt: evaluationResult.analyzedAt || new Date().toISOString(),
        };
        setResult(enriched);
        markEvaluated(enriched.applicationId, enriched);
        return enriched;
      } catch (err) {
        setResult(null);
        setError(err.message || 'Evaluation failed');
        return null;
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
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!applicationId) {
      setMessages([]);
      setError(null);
      setHistoryLoading(false);
      return undefined;
    }

    let cancelled = false;
    (async () => {
      setHistoryLoading(true);
      setError(null);
      try {
        const history = await getChatHistory(applicationId);
        if (!cancelled) setMessages(history);
      } catch (err) {
        if (!cancelled) {
          setMessages([]);
          setError(err.message || 'Failed to load chat history');
        }
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applicationId]);

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
        return null;
      } finally {
        setLoading(false);
      }
    },
    [applicationId]
  );

  return { messages, send, loading, historyLoading, error, setMessages };
}

export default useFraudAnalysis;
