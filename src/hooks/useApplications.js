import { useCallback, useEffect, useRef, useState } from 'react';
import { getApplications } from '../services/fraudService';
import { useAppContext } from '../context';
import { mockScenarios } from '../data/mockScenarios';

export function useApplications() {
  const { applications, setApplications } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchedRef = useRef(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getApplications();
      if (Array.isArray(data) && data.length) {
        setApplications((prev) => mergeApplications(prev, data));
      }
    } catch (err) {
      setError(err.message);
      setApplications((prev) => (prev.length ? prev : mockScenarios));
    } finally {
      setLoading(false);
    }
  }, [setApplications]);

  useEffect(() => {
    if (fetchedRef.current) return undefined;
    fetchedRef.current = true;
    let cancelled = false;

    (async () => {
      // Keep seeded rows visible; only flip loading if the list is empty.
      if (applications.length === 0) setLoading(true);
      try {
        const data = await getApplications();
        if (cancelled) return;
        if (Array.isArray(data) && data.length) {
          setApplications((prev) => mergeApplications(prev, data));
        }
      } catch (err) {
        if (cancelled) return;
        setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Intentionally run once on mount to hydrate from API / mock adapter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setApplications]);

  return { applications, loading, error, refresh };
}

function mergeApplications(prev, incoming) {
  const byId = new Map(incoming.map((app) => [app.id, { ...app }]));
  for (const app of prev) {
    if (byId.has(app.id)) {
      byId.set(app.id, { ...byId.get(app.id), ...app });
    } else {
      byId.set(app.id, app);
    }
  }
  return Array.from(byId.values());
}

export default useApplications;
