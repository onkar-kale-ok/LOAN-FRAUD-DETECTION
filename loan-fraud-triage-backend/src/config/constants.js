import './loadEnv.js';

export const PORT = Number(process.env.PORT) || 5000;

export const API_TOKEN = process.env.API_TOKEN || 'dev-api-token';

export const FRONTEND_ORIGIN =
  process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

export const API_PREFIX = '/api/v1';

export const LLM_WRAPPER_URL =
  process.env.LLM_WRAPPER_URL ||
  'https://llm-wrapper-741152993481.asia-south1.run.app/llm/query';

export const LLM_WRAPPER_TOKEN = process.env.LLM_WRAPPER_TOKEN || '';

export const LLM_TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS) || 60000;

export const ROLES = {
  ANALYST: 'ANALYST',
  GUEST: 'GUEST',
};

export default {
  PORT,
  API_TOKEN,
  FRONTEND_ORIGIN,
  API_PREFIX,
  LLM_WRAPPER_URL,
  LLM_WRAPPER_TOKEN,
  LLM_TIMEOUT_MS,
  ROLES,
};
