import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildApplicationList } from '../src/utils/applicationList.js';

const records = [
  {
    applicationId: 'APP-2026-1001',
    applicationTimestamp: '2026-01-01T10:00:00.000Z',
    applicant: { name: 'Rahul', companyName: 'TechCorp' },
    riskTier: 'HIGH',
    riskScore: 92,
    decisionStatus: 'PENDING_REVIEW',
    redFlags: [{ code: 'A' }, { code: 'B' }],
  },
  {
    applicationId: 'APP-2026-1002',
    applicationTimestamp: '2026-03-01T10:00:00.000Z',
    applicant: { name: 'Ananya', companyName: 'Infosys' },
    riskTier: 'LOW',
    riskScore: 14,
    redFlags: [],
  },
  {
    applicationId: 'APP-2026-1003',
    evaluatedAt: '2026-02-01T10:00:00.000Z',
    evaluationResult: { applicantName: 'Vikram', riskTier: 'MEDIUM' },
    status: 'UNDER_REVIEW',
    redFlags: [{ code: 'X' }],
  },
];

describe('buildApplicationList', () => {
  it('sorts descending by applicationTimestamp', () => {
    const rows = buildApplicationList(records);
    assert.deepEqual(
      rows.map((row) => row.applicationId),
      ['APP-2026-1002', 'APP-2026-1003', 'APP-2026-1001']
    );
  });

  it('filters by riskTier (case-insensitive)', () => {
    const rows = buildApplicationList(records, { riskTier: 'high' });
    assert.equal(rows.length, 1);
    assert.equal(rows[0].applicationId, 'APP-2026-1001');
    assert.equal(rows[0].redFlagsCount, 2);
  });

  it('maps legacy UNDER_REVIEW status to PENDING_REVIEW', () => {
    const rows = buildApplicationList(records, { riskTier: 'MEDIUM' });
    assert.equal(rows.length, 1);
    assert.equal(rows[0].decisionStatus, 'PENDING_REVIEW');
    assert.equal(rows[0].applicantName, 'Vikram');
  });
});
