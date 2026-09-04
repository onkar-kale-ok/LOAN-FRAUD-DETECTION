import api from './api';
import mockAdapter from './mockAdapter';

async function withFallback(apiCall, fallbackCall) {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.info('[fraudService] Falling back to mock adapter:', error.message);
    }
    return fallbackCall();
  }
}

export async function analyzeApplication(payload) {
  return withFallback(
    () => api.post('/analyze', payload),
    () => mockAdapter.analyzeApplication(payload)
  );
}

export async function getApplications() {
  return withFallback(
    () => api.get('/applications'),
    () => mockAdapter.getApplications()
  );
}

export async function getApplicationById(id) {
  return withFallback(
    () => api.get(`/applications/${id}`),
    () => mockAdapter.getApplicationById(id)
  );
}

export async function sendAssistantQuery(id, message) {
  return withFallback(
    () => api.post(`/applications/${id}/chat`, { message }),
    () => mockAdapter.sendAssistantQuery(id, message)
  );
}

const fraudService = {
  analyzeApplication,
  getApplications,
  getApplicationById,
  sendAssistantQuery,
};

export default fraudService;
