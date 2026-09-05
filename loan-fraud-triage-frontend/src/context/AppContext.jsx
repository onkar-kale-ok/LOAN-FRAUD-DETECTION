import { createContext, useMemo, useState, useCallback } from 'react';
import { ROLES } from './roles';
import { coerceApplicationPayload } from '../data/mockScenarios';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [userRole, setUserRoleState] = useState(() => {
    return localStorage.getItem('userRole') || 'ANALYST';
  });
  const [activeTab, setActiveTab] = useState('evaluation');
  const [applications, setApplications] = useState([]);
  const [evaluatedIds, setEvaluatedIds] = useState({});
  const [activeApplicationId, setActiveApplicationId] = useState('');
  const [latestResult, setLatestResult] = useState(null);

  const setUserRole = useCallback((role) => {
    const next = role === 'GUEST' ? 'GUEST' : 'ANALYST';
    setUserRoleState(next);
    localStorage.setItem('userRole', next);
  }, []);

  const upsertApplication = useCallback((app) => {
    setApplications((prev) => {
      const idx = prev.findIndex(
        (a) =>
          a.id === app.id ||
          a.applicationId === app.id ||
          (app.applicationId && a.applicationId === app.applicationId)
      );
      if (idx === -1) return [app, ...prev];
      const next = [...prev];
      next[idx] = { ...next[idx], ...app };
      return next;
    });
  }, []);

  const markEvaluated = useCallback((id, result) => {
    setEvaluatedIds((prev) => ({
      ...prev,
      [id]: {
        riskTier: result.riskTier,
        riskScore: result.riskScore,
        evaluatedAt: result.analyzedAt || result.evaluatedAt || new Date().toISOString(),
      },
    }));
    setLatestResult(result);
    const fields = coerceApplicationPayload(result);
    upsertApplication({
      ...fields,
      id: result.applicationId || fields.applicationId || id,
      applicantName: result.applicantName || fields.applicantName,
      riskScore: result.riskScore,
      riskTier: result.riskTier,
      status: result.status,
      redFlags: result.redFlags,
      aiReviewerNote: result.aiReviewerNote,
    });
  }, [upsertApplication]);

  const navigateToAssistant = useCallback((applicationId) => {
    if (applicationId) setActiveApplicationId(applicationId);
    setActiveTab('assistant');
  }, []);

  const value = useMemo(
    () => ({
      userRole,
      setUserRole,
      roles: ROLES,
      activeTab,
      setActiveTab,
      applications,
      setApplications,
      upsertApplication,
      evaluatedIds,
      markEvaluated,
      activeApplicationId,
      setActiveApplicationId,
      navigateToAssistant,
      latestResult,
      setLatestResult,
    }),
    [
      userRole,
      setUserRole,
      activeTab,
      applications,
      upsertApplication,
      evaluatedIds,
      markEvaluated,
      activeApplicationId,
      navigateToAssistant,
      latestResult,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export default AppContext;
