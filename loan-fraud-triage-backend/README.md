# Loan Fraud Triage Backend

Express API for scenarios, LLM evaluation, application review, and contextual chat.

## Setup

```bash
cd loan-fraud-triage-backend
copy .env.example .env
# set LLM_WRAPPER_TOKEN in .env
npm install
npm start
```

`src/config/loadEnv.js` loads `.env` from this folder. `npm run dev` auto-restarts. `npm test` covers schemas, list/filter, chat 400/404, Analyst-only decision/chat, and LLM parse-or-502 fixtures.

Server: **http://localhost:5000**. `GET /health` for liveness. CORS: `http://localhost:5173`.

Fraud scoring and chat share `src/services/llmClient.js`. Invalid evaluation JSON from the wrapper is a 502.

`PATCH /api/v1/applications/:id/decision` and `POST /api/v1/applications/:id/chat` require header `X-User-Role: ANALYST`. Other routes are not role-gated. Guest PII masking is frontend-only.
