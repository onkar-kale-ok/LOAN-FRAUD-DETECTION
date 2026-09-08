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

All `/api/v1` routes require `X-User-Role: ANALYST` or `GUEST`. Missing header → 403.

- **Guest:** GET scenarios, applications, application by id, chat history, network.
- **Analyst:** all of the above plus `POST /evaluate`, `PATCH .../decision`, `POST .../chat`.

PII masking in the UI is still frontend-only. The header is simulated RBAC, not login.
