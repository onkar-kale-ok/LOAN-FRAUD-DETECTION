import { readFile } from 'node:fs/promises';
import { DATA_FILES, appendEvaluation, readJson } from '../services/storageService.js';
import { LlmClientError, runFraudEngine } from '../services/fraudEngineService.js';
import {
  evaluationSchema,
  parseEvaluatePayload,
} from '../schemas/evaluationSchema.js';
import { generateApplicationId } from '../utils/idGenerator.js';
import { computeAddressMatchScore } from '../utils/addressMatch.js';
import { buildCrossAppSignals } from '../utils/crossAppSignals.js';
import { assessSalaryVsRole } from '../utils/salaryHeuristic.js';

export async function getScenarios(_req, res) {
  try {
    const raw = await readFile(DATA_FILES.dummy, 'utf8');
    const parsed = JSON.parse(raw);
    const data = Array.isArray(parsed) ? parsed : [];
    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error('[getScenarios]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load scenarios from dummydata.json',
    });
  }
}

export async function evaluateApplication(req, res, next) {
  try {
    const parsed = parseEvaluatePayload(req.body);
    const validation = evaluationSchema.safeParse(parsed);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.flatten(),
      });
    }

    const inputData = validation.data;
    const existing = await readJson(DATA_FILES.evaluations, []);
    const applicationId = generateApplicationId(existing);
    const pdfBuffer = req.file?.buffer;

    const computedAddressMatch = computeAddressMatchScore(
      inputData.applicant.address,
      inputData.documentOcr.ocrExtractedAddress
    );
    const addressMatchScore =
      inputData.documentOcr.addressMatchScore ?? computedAddressMatch;

    const crossApp = buildCrossAppSignals(inputData, existing);
    const salary = assessSalaryVsRole({
      employmentType: inputData.applicant.employmentType,
      declaredIncome: inputData.financials.declaredIncome,
      companyName: inputData.applicant.companyName,
    });

    const enrichedInput = {
      ...inputData,
      telemetry: {
        ...inputData.telemetry,
        deviceReuseCount: crossApp.computedDeviceReuseCount,
        reportedDeviceReuseCount: crossApp.reportedDeviceReuseCount,
      },
      documentOcr: {
        ...inputData.documentOcr,
        addressMatchScore,
        computedAddressMatch,
      },
    };

    let engine;
    try {
      engine = await runFraudEngine(enrichedInput, pdfBuffer, { crossApp, salary });
    } catch (error) {
      if (error instanceof LlmClientError) {
        return res.status(error.status || 502).json({
          success: false,
          message: error.message,
        });
      }
      throw error;
    }

    if (engine.source !== 'llm') {
      return res.status(502).json({
        success: false,
        message: 'Evaluation rejected: result was not produced by the LLM',
      });
    }

    const evaluatedAt = new Date().toISOString();
    const applicationTimestamp =
      inputData.telemetry.applicationTimestamp || evaluatedAt;

    const record = {
      applicationId,
      applicationTimestamp,
      evaluatedAt,
      decisionStatus: 'PENDING_REVIEW',
      reviewerNotes: '',
      applicant: inputData.applicant,
      financials: inputData.financials,
      telemetry: enrichedInput.telemetry,
      documentOcr: {
        ...enrichedInput.documentOcr,
        uploadedBankStatement:
          req.file?.originalname || inputData.documentOcr.uploadedBankStatement,
      },
      corpusSignals: {
        ...crossApp,
        salary,
      },
      bankStatement: req.file
        ? {
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            attached: true,
          }
        : inputData.documentOcr.uploadedBankStatement
          ? {
              originalName: inputData.documentOcr.uploadedBankStatement,
              attached: false,
              mock: true,
            }
          : null,
      riskScore: engine.riskScore,
      riskTier: engine.riskTier,
      status: engine.status,
      redFlags: engine.redFlags,
      aiReviewerNote: engine.aiReviewerNote,
      engineSource: 'llm',
    };

    const evaluationResult = {
      applicationId,
      analyzedAt: evaluatedAt,
      applicantName: inputData.applicant.name,
      companyName: inputData.applicant.companyName,
      panNumber: inputData.applicant.panNumber,
      phoneNumber: inputData.applicant.phone,
      email: inputData.applicant.email,
      address: inputData.applicant.address,
      employmentType: inputData.applicant.employmentType,
      declaredIncome: inputData.financials.declaredIncome,
      ocrBankIncome: inputData.financials.ocrBankIncome,
      bankStatementSummary: inputData.financials.bankStatementSummary,
      deviceId: enrichedInput.telemetry.deviceId,
      ipAddress: inputData.telemetry.ipAddress,
      ipLocation: inputData.telemetry.ipLocation,
      deviceReuseCount: crossApp.computedDeviceReuseCount,
      reportedDeviceReuseCount: crossApp.reportedDeviceReuseCount,
      applicationTimestamp,
      addressMatchScore,
      computedAddressMatch,
      ocrExtractedAddress: inputData.documentOcr.ocrExtractedAddress,
      documentTamperFlag: inputData.documentOcr.documentTamperFlag,
      bankStatementFileName:
        record.documentOcr.uploadedBankStatement ||
        record.bankStatement?.originalName ||
        '',
      bankStatementParsed: Boolean(record.bankStatement),
      riskScore: engine.riskScore,
      riskTier: engine.riskTier,
      status: engine.status,
      redFlags: engine.redFlags,
      aiReviewerNote: engine.aiReviewerNote,
      engineSource: 'llm',
    };

    await appendEvaluation({ ...record, evaluationResult });

    return res.status(200).json({
      success: true,
      applicationId,
      evaluationResult,
      data: {
        ...record,
        evaluationResult,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export default { getScenarios, evaluateApplication };
