import { useCallback, useEffect, useState } from 'react';
import { getApplications } from '../services/fraudService';
import { useAppContext } from '../context';
import { mockScenarios } from '../data/mockScenarios';

export function useApplications() {
  const { applications, setApplications } = useAppContext();
  const [loading, setLoading] = useState(() => applications.length === 0);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(() => applications.length > 0);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getApplications();
      setApplications(Array.isArray(data) && data.length ? data : mockScenarios);
      setHasLoaded(true);
    } catch (err) {
      setError(err.message);
      setApplications(mockScenarios);
      setHasLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [setApplications]);

  useEffect(() => {
    if (hasLoaded) return undefined;
    let cancelled = false;

    (async () => {
      try {
        const data = await getApplications();
        if (cancelled) return;
        setApplications(Array.isArray(data) && data.length ? data : mockScenarios);
        setHasLoaded(true);
      } catch (err) {
        if (cancelled) return;
        setError(err.message);
        setApplications(mockScenarios);
        setHasLoaded(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasLoaded, setApplications]);

  return { applications, loading, error, refresh };
}

export default useApplications;
