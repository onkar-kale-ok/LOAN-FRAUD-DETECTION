import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  evaluationSchema,
  parseEvaluatePayload,
} from '../src/schemas/evaluationSchema.js';

const validPayload = {
  applicant: {
    name: 'Rahul Sharma',
    companyName: 'TechCorp Solutions Pvt Ltd',
    panNumber: 'ABCDE1234F',
    phone: '+91 98765 43210',
    email: 'rahul.sharma88@gmail.com',
  },
  financials: {
    declaredIncome: 1800000,
    ocrBankIncome: 540000,
  },
  telemetry: {
    deviceId: 'DEV-39482-PUN',
    ipAddress: '103.22.140.12',
    ipLocation: 'Pune, MH, India (Proxy/VPN Flagged)',
    deviceReuseCount: 5,
  },
  documentOcr: {
    addressMatchScore: 42,
    documentTamperFlag: true,
  },
};

describe('evaluationSchema', () => {
  it('accepts a complete nested payload', () => {
    const result = evaluationSchema.safeParse(validPayload);
    assert.equal(result.success, true);
    assert.equal(result.data.applicant.name, 'Rahul Sharma');
    assert.equal(result.data.documentOcr.documentTamperFlag, true);
  });

  it('rejects a missing applicant block', () => {
    const { applicant: _applicant, ...rest } = validPayload;
    const result = evaluationSchema.safeParse(rest);
    assert.equal(result.success, false);
  });

  it('rejects an invalid email', () => {
    const result = evaluationSchema.safeParse({
      ...validPayload,
      applicant: { ...validPayload.applicant, email: 'not-an-email' },
    });
    assert.equal(result.success, false);
  });

  it('coerces string "false" for documentTamperFlag', () => {
    const result = evaluationSchema.safeParse({
      ...validPayload,
      documentOcr: { addressMatchScore: 80, documentTamperFlag: 'false' },
    });
    assert.equal(result.success, true);
    assert.equal(result.data.documentOcr.documentTamperFlag, false);
  });

  it('parses a JSON payload wrapper string', () => {
    const parsed = parseEvaluatePayload({ payload: JSON.stringify(validPayload) });
    const result = evaluationSchema.safeParse(parsed);
    assert.equal(result.success, true);
    assert.equal(result.data.telemetry.deviceReuseCount, 5);
  });
});
