import './src/config/loadEnv.js';
import app from './src/app.js';
import { PORT } from './src/config/constants.js';

app.listen(PORT, () => {
  console.log(`loan-fraud-triage-backend listening on http://localhost:${PORT}`);
});
