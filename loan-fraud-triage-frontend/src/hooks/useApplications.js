import { useCallback, useEffect, useState } from 'react';
import { getApplications } from '../services/fraudService';
import { useAppContext } from '../context';

export function useApplications(riskTier = 'ALL') {
  const { applications, setApplications } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getApplications(riskTier);
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [riskTier, setApplications]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getApplications(riskTier);
        if (cancelled) return;
        setApplications(Array.isArray(data) ? data : []);
      } catch (err) {
        if (cancelled) return;
        setError(err.message);
        setApplications([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [riskTier, setApplications]);

  return { applications, loading, error, refresh };
}

export default useApplications;
