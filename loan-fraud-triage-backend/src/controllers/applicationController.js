import {
  DATA_FILES,
  readJson,
  updateEvaluationById,
} from '../services/storageService.js';
import { buildApplicationList } from '../utils/applicationList.js';
import { buildFraudNetwork } from '../utils/crossAppSignals.js';

export {
  getApplicationTimestamp,
  getDecisionStatus,
} from '../utils/applicationList.js';

export async function listApplications(req, res, next) {
  try {
    const stored = await readJson(DATA_FILES.evaluations, []);
    const rows = buildApplicationList(stored, { riskTier: req.query.riskTier });

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getApplicationById(req, res, next) {
  try {
    const stored = await readJson(DATA_FILES.evaluations, []);
    const list = Array.isArray(stored) ? stored : [];
    const found = list.find((row) => row.applicationId === req.params.id);

    if (!found) {
      return res.status(404).json({
        success: false,
        message: `Application ${req.params.id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: found,
    });
  } catch (error) {
    return next(error);
  }
}

export async function patchApplicationDecision(req, res, next) {
  try {
    const { decisionStatus, reviewerNotes } = req.body;
    const updated = await updateEvaluationById(req.params.id, (record) => ({
      ...record,
      decisionStatus,
      reviewerNotes,
      updatedAt: new Date().toISOString(),
    }));

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Application ${req.params.id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getFraudNetwork(req, res, next) {
  try {
    const stored = await readJson(DATA_FILES.evaluations, []);
    const graph = buildFraudNetwork(stored);
    return res.status(200).json({
      success: true,
      ...graph,
    });
  } catch (error) {
    return next(error);
  }
}

export default {
  listApplications,
  getApplicationById,
  patchApplicationDecision,
  getFraudNetwork,
};
