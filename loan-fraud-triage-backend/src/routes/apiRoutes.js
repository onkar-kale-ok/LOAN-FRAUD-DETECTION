import { Router } from 'express';
import multer from 'multer';
import {
  evaluateApplication,
  getScenarios,
} from '../controllers/evaluationController.js';
import {
  getApplicationById,
  getFraudNetwork,
  listApplications,
  patchApplicationDecision,
} from '../controllers/applicationController.js';
import { getHistory, postChat } from '../controllers/chatController.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { requireAnalyst, requireReviewer } from '../middleware/rbacMiddleware.js';
import { decisionBodySchema } from '../schemas/decisionSchema.js';

const router = Router();

const bankStatementUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const isPdf =
      file.mimetype === 'application/pdf' ||
      file.originalname?.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      return cb(new Error('bankStatement must be a PDF file'));
    }
    return cb(null, true);
  },
}).single('bankStatement');

function handleBankStatementUpload(req, res, next) {
  bankStatementUpload(req, res, (error) => {
    if (!error) return next();
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to process bank statement upload',
    });
  });
}

router.get('/scenarios', requireReviewer, getScenarios);
router.post(
  '/evaluate',
  requireAnalyst,
  handleBankStatementUpload,
  evaluateApplication
);
router.get('/applications', requireReviewer, listApplications);
router.get('/network', requireReviewer, getFraudNetwork);
router.patch(
  '/applications/:id/decision',
  requireAnalyst,
  validateBody(decisionBodySchema),
  patchApplicationDecision
);
router.get('/applications/:id/chat/history', requireReviewer, getHistory);
router.post('/applications/:id/chat', requireAnalyst, postChat);
router.get('/applications/:id', requireReviewer, getApplicationById);

export default router;
