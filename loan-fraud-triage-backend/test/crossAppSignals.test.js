import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { computeAddressMatchScore } from '../src/utils/addressMatch.js';
import { buildCrossAppSignals, buildFraudNetwork } from '../src/utils/crossAppSignals.js';
import { assessSalaryVsRole } from '../src/utils/salaryHeuristic.js';
import { applyBlockPromotion, tierFromScore } from '../src/utils/riskBands.js';

describe('computeAddressMatchScore', () => {
  it('scores overlapping address tokens', () => {
    const score = computeAddressMatchScore(
      '18 Indiranagar 12th Main, Bengaluru, KA 560038',
      'Ananya Verma, 18 Indiranagar 12th Main, Bengaluru, KA 560038'
    );
    assert.equal(score > 50, true);
  });

  it('returns 0 when one side is empty', () => {
    assert.equal(computeAddressMatchScore('Pune', ''), 0);
  });
});

describe('buildCrossAppSignals', () => {
  const existing = [
    {
      applicationId: 'APP-2026-1001',
      applicant: {
        name: 'Rahul',
        phone: '+91 98765 43210',
        email: 'rahul.sharma88@gmail.com',
        address: '12 MG Road, Pune',
        companyName: 'TechCorp Solutions Pvt Ltd',
      },
      telemetry: { deviceId: 'DEV-39482-PUN' },
    },
  ];

  it('counts this filing plus prior device matches', () => {
    const signals = buildCrossAppSignals(
      {
        applicant: { phone: '+91 98765 43210', email: 'amit@x.com', address: 'Other', companyName: 'X' },
        telemetry: { deviceId: 'DEV-39482-PUN', deviceReuseCount: 1 },
      },
      existing
    );
    assert.equal(signals.computedDeviceReuseCount, 2);
    assert.deepEqual(signals.deviceMatches, ['APP-2026-1001']);
    assert.equal(signals.duplicatePhone, true);
    assert.equal(signals.duplicateEmail, false);
  });
});

describe('buildFraudNetwork', () => {
  it('links two apps that share a device', () => {
    const graph = buildFraudNetwork([
      {
        applicationId: 'A1',
        applicant: { name: 'Rahul', phone: '1', email: 'a@a.com', address: 'X', companyName: 'Acme' },
        telemetry: { deviceId: 'DEV-1' },
        riskTier: 'HIGH',
        riskScore: 80,
      },
      {
        applicationId: 'A2',
        applicant: { name: 'Amit', phone: '2', email: 'b@b.com', address: 'Y', companyName: 'Acme' },
        telemetry: { deviceId: 'DEV-1' },
        riskTier: 'BLOCK',
        riskScore: 92,
      },
    ]);
    assert.equal(graph.nodes.length, 2);
    assert.equal(graph.edges.some((e) => e.type === 'device'), true);
    assert.equal(graph.edges.some((e) => e.type === 'employer'), true);
  });
});

describe('assessSalaryVsRole', () => {
  it('flags unemployed with high declared income', () => {
    const result = assessSalaryVsRole({
      employmentType: 'Unemployed',
      declaredIncome: 2500000,
      companyName: 'N/A',
    });
    assert.equal(result.flagged, true);
  });
});

describe('tierFromScore', () => {
  it('uses BLOCK at 90+', () => {
    assert.equal(tierFromScore(90), 'BLOCK');
    assert.equal(tierFromScore(75), 'HIGH');
  });

  it('promotes HIGH to BLOCK on a severe ring plus salary flag', () => {
    const tier = applyBlockPromotion('HIGH', 80, { computedDeviceReuseCount: 4 }, { flagged: true });
    assert.equal(tier, 'BLOCK');
  });
});
