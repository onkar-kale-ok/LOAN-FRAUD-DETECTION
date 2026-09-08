import express from 'express';
import cors from 'cors';
import { API_PREFIX, FRONTEND_ORIGIN } from './config/constants.js';
import apiRoutes from './routes/apiRoutes.js';

const app = express();

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    allowedHeaders: ['Content-Type', 'Accept', 'X-User-Role'],
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, status: 'ok' });
});

app.use(API_PREFIX, apiRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

export default app;
