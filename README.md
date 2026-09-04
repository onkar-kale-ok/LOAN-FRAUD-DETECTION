# AI Fraud Detection & Risk Triage Engine

Production-ready React frontend for an AI-powered loan application fraud detection dashboard.

## Stack

- Vite + React 19
- Tailwind CSS v4
- Axios (with offline mock fallback)
- Lucide React icons

## Features

- **Tab 1 — New Evaluation**: Scenario presets, form/JSON dual view, AI fraud analysis result panel
- **Tab 2 — Fraud Log**: Filterable application table with RBAC-aware PII masking
- **Tab 3 — AI Assistant**: Target application selector, quick-action chips, chat thread
- **RBAC**: ANALYST (unmasked) / GUEST (masked identifiers)
- **Offline-first API layer**: Falls back to `mockScenarios` when `localhost:5000` is unavailable

## Getting Started

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`. Backend expected at `http://localhost:5000/api` (optional — mock adapter covers offline use).

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start Vite dev server    |
| `npm run build`| Production build         |
| `npm run preview` | Preview production build |
| `npm run lint` | Run oxlint               |

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
│   ├── fraudService.js
│   └── mockAdapter.js
├── utils/
├── App.jsx
└── main.jsx
```
