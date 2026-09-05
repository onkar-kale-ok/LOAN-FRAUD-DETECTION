# Loan Fraud Triage Frontend

Vite + React dashboard for loan-application evaluation, review, and chat.

## Stack

- Vite + React
- Tailwind CSS
- Axios (`VITE_API_URL`, 90s timeout)
- Lucide React icons

## Features

- **Tab 1 — New Evaluation**: Scenario presets, form/JSON dual view, PDF attach, LLM result panel
- **Tab 2 — Fraud Log**: Filterable table; Guest **UI** masking of identifiers on details
- **Tab 3 — AI Assistant**: Application selector, quick-action chips, live chat
- **Role switch**: Analyst can save decisions and chat. Guest is masked in the UI; the API only enforces Analyst on `PATCH .../decision` and `POST .../chat`

PDF attached on Tab 1 is sent to the backend for the LLM. Form OCR fields are not simulated from that file.

## Getting Started

```bash
cd loan-fraud-triage-frontend
cp .env.example .env
npm install
npm run dev
```

App: `http://localhost:5173`. Backend: `http://localhost:5000` (see repo-root README).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run oxlint |

## Project Structure

```text
src/
├── assets/
├── components/
│   ├── common/
│   ├── layout/
│   └── tabs/
│       ├── Tab1Evaluation/
│       ├── Tab2FraudLog/
│       └── Tab3Assistant/
├── context/
├── data/mockScenarios.js
├── hooks/
├── services/
│   ├── api.js
│   └── fraudService.js
├── utils/
├── App.jsx
└── main.jsx
```
