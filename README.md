# AI Fraud Detection & Risk Triage Engine

Loan-underwriting demo: a React dashboard and an Express API that score applications with a hosted LLM, persist results to JSON, and support analyst review plus a contextual chatbot.

```text
loan-fraud-detection/
├── loan-fraud-triage-frontend/   # Vite + React dashboard (port 5173)
├── loan-fraud-triage-backend/    # Express API (port 5000)
└── README.md                     # This file
```

You need **Node.js 18+**. Run frontend and backend in **two terminals**.

---

## 1. Backend setup

```bash
cd loan-fraud-triage-backend
npm install
npm start
```

Auto-reload during development:

```bash
npm run dev
```

The API listens at **http://localhost:5000**. Check liveness:

```bash
curl http://localhost:5000/health
```

CORS allows the Vite app at `http://localhost:5173`.

Copy `loan-fraud-triage-backend/.env.example` to `.env` and set `LLM_WRAPPER_TOKEN`. The process loads that file via `src/config/loadEnv.js` (you do not need to export vars in the shell). Do not commit `.env`.

```bash
cd loan-fraud-triage-backend
cp .env.example .env
# edit .env and paste LLM_WRAPPER_TOKEN
npm install
npm start
```

Run tests (includes LLM parse-or-502 fixtures):

```bash
cd loan-fraud-triage-backend
npm test
```

Environment variables (see `.env.example`):

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5000` | HTTP port |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | CORS origin |
| `LLM_WRAPPER_URL` | Biz2X Cloud Run `/llm/query` | Fraud + chat LLM |
| `LLM_WRAPPER_TOKEN` | *(required in `.env`, never commit)* | Bearer token for the wrapper |
| `LLM_TIMEOUT_MS` | `60000` | LLM request timeout |

Evaluations are stored in:

`loan-fraud-triage-backend/src/data/evaluation.json`

Scenario presets (form fill only, not scores) live in:

`loan-fraud-triage-backend/src/data/dummydata.json`

After changing backend code, restart `npm start` if you are not using `npm run dev`.

---

## 2. Frontend setup

```bash
cd loan-fraud-triage-frontend
npm install
npm run dev
```

The dashboard opens at **http://localhost:5173**. API base URL is `VITE_API_URL` (default `http://localhost:5000/api`); Axios timeout is 90s for all routes.

Copy `loan-fraud-triage-frontend/.env.example` to `.env` if you need a non-default API URL.

Keep both processes running. If only the UI is up, scenario load, evaluate, the fraud log, and chat will fail.

---

## 3. How the application runs (end to end)

Open **http://localhost:5173**. Use the header to switch **Analyst** vs **Guest**.

- **UI:** Guest masks PAN/phone/device/IP on detail views. List rows barely show PII.
- **API:** Only `PATCH .../decision` and `POST .../chat` check `X-User-Role: ANALYST` (otherwise 403). Other routes are not role-gated. This is not full RBAC.

### Tab 1 — Risk Triage (evaluate)

1. **Scenario Preset** loads `GET /api/v1/scenarios` (Rahul / Ananya / Vikram). Pick one to fill the form, or leave blank for a custom case.
2. Edit fields in **Form View** or **Raw JSON** (including **email** — required by the API; not invented by the client). Optionally attach a bank-statement **PDF**. OCR income/address stay as typed or from the scenario; attaching a PDF does not fake OCR. The PDF (as `pdfBase64`) is what the LLM uses for statement evidence.
3. Click **Run AI Fraud Evaluation**.
4. The UI sends `POST /api/v1/evaluate` as `multipart/form-data`:
   - `payload` — nested JSON (`applicant`, `financials`, `telemetry`, `documentOcr`)
   - `bankStatement` — PDF file, if attached
5. The backend validates with Zod, assigns `APP-YYYY-XXXX`, and POSTs the case (and PDF as `pdfBase64` when present) to the LLM wrapper.
6. On success it writes a record to `evaluation.json` with risk score, tier, red flags, reviewer note, `applicationTimestamp`, and `decisionStatus: PENDING_REVIEW`.
7. Tab 1 shows the live `evaluationResult` (gauge, comparison, flags, note). Nothing is saved if the LLM call fails.

### Tab 2 — Fraud Application Log (review)

1. The table loads `GET /api/v1/applications` (newest first). Filter with `?riskTier=HIGH|MEDIUM|LOW` via the dropdown.
2. Columns: application ID, applicant, company, timestamp, risk, decision, red-flag count.
3. **Details** calls `GET /api/v1/applications/:id` and shows the full stored JSON (PII, income, device, flags).
4. **Decision** calls `PATCH /api/v1/applications/:id/decision` with:
   - `decisionStatus`: `APPROVED` | `REJECTED` | `FLAGGED_FOR_AUDIT` | `PENDING_REVIEW`
   - `reviewerNotes`
5. The file is updated with `updatedAt`. Analysts can save decisions; Guests can view only.

If the log is empty, no LLM evaluation has succeeded yet.

### Tab 3 — AI Fraud Assistant (chat)

1. The application dropdown uses the same list as Tab 2 (`GET /api/v1/applications`).
2. Selecting an ID loads `GET /api/v1/applications/:id/chat/history`.
3. Quick actions or the composer send `POST /api/v1/applications/:id/chat` with `{ "message": "..." }`.
4. The backend looks up that record, builds a prompt from applicant, income, device, IP, risk, summary, and red flags, then calls the same LLM wrapper.
5. The reply is shown in the thread and appended to `chatHistory` on that record in `evaluation.json`.

Chat is disabled until you select an evaluated application.

---

## 4. API map (`/api/v1`)

| Method | Path | Used by |
| --- | --- | --- |
| `GET` | `/health` | Liveness (no `/api` prefix) |
| `GET` | `/api/v1/scenarios` | Tab 1 presets |
| `POST` | `/api/v1/evaluate` | Tab 1 run evaluation (`multipart`, field `bankStatement`) |
| `GET` | `/api/v1/applications` | Tab 2 / Tab 3 list (`?riskTier=` optional) |
| `GET` | `/api/v1/applications/:id` | Tab 2 details |
| `PATCH` | `/api/v1/applications/:id/decision` | Tab 2 decision |
| `GET` | `/api/v1/applications/:id/chat/history` | Tab 3 history |
| `POST` | `/api/v1/applications/:id/chat` | Tab 3 send message |

---

## 5. Execution path (data)

```text
Browser (5173)
    → Express (5000)
        → Zod / multer
        → LLM wrapper (Cloud Run)
        → src/data/evaluation.json
    ← evaluationResult / list row / chat reply
```

Preset JSON only **fills the form**. Scores and chat answers always come from the LLM (`src/services/llmClient.js`), then from `evaluation.json`. Evaluation JSON that cannot be parsed is a **502**.

---

## 6. Typical first run

1. Start backend, then frontend.
2. Confirm `GET http://localhost:5000/health` returns `{ "success": true, "status": "ok" }`.
3. In Tab 1, pick a scenario and click **Run AI Fraud Evaluation**.
4. When the wrapper token is valid, a result appears and a row is written to `evaluation.json`.
5. Open Tab 2 — the row is there; open details or set a decision.
6. Open Tab 3 — select that application ID and ask a question (for example “Why is this High Risk?”).

If the LLM token is not active yet, evaluate and chat return a provider error and **do not** invent a score. Retry after the token is enabled; no code change is required unless you override `LLM_WRAPPER_TOKEN`.
