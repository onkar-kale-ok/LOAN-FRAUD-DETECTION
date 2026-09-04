/**
 * Seed mock loan applications for offline demo & scenario presets.
 */
export const mockScenarios = [
  {
    id: 'APP-2026-8842',
    applicantName: 'Rahul Sharma',
    declaredIncome: 1850000,
    ocrIncome: 620000,
    deviceId: 'DEV-RING-8842-A7',
    ipAddress: '103.211.45.92',
    pan: 'ABCPK4521L',
    phone: '+91 98765 43210',
    status: 'FLAGGED',
    riskScore: 92,
    riskTier: 'HIGH',
    redFlags: [
      {
        code: 'INCOME_MISMATCH',
        label: 'Income Mismatch',
        evidence:
          'Declared income ₹18,50,000 is 198% higher than OCR-extracted salary slip income ₹6,20,000.',
      },
      {
        code: 'DEVICE_RING',
        label: 'Device Ring',
        evidence:
          'Device DEV-RING-8842-A7 linked to 7 prior applications within 45 days across 4 identities.',
      },
      {
        code: 'IP_ANOMALY',
        label: 'Suspicious IP Cluster',
        evidence:
          'IP 103.211.45.92 shares a /24 subnet with 12 high-risk applications in the last 30 days.',
      },
    ],
    aiReviewerNote:
      'High-confidence fraud pattern. Income inflation combined with a known device ring strongly suggests coordinated synthetic identity abuse. Recommend hard decline and device blacklist.',
    label: 'APP-2026-8842 — Rahul Sharma (High Risk: Income Mismatch & Device Ring)',
  },
  {
    id: 'APP-2026-1012',
    applicantName: 'Ananya Verma',
    declaredIncome: 980000,
    ocrIncome: 945000,
    deviceId: 'DEV-MOB-1012-C3',
    ipAddress: '49.36.112.18',
    pan: 'BGHPV8821M',
    phone: '+91 91234 56780',
    status: 'UNDER_REVIEW',
    riskScore: 58,
    riskTier: 'MEDIUM',
    redFlags: [
      {
        code: 'VELOCITY_SPIKE',
        label: 'Application Velocity',
        evidence:
          'Three applications submitted from the same device fingerprint within 72 hours.',
      },
      {
        code: 'ADDRESS_DRIFT',
        label: 'Address Drift',
        evidence:
          'Residential address changed twice in 90 days relative to KYC records.',
      },
    ],
    aiReviewerNote:
      'Moderate risk. Income documents are consistent, but application velocity and address drift warrant manual review before approval.',
    label: 'APP-2026-1012 — Ananya Verma (Medium Risk: Velocity & Address Drift)',
  },
  {
    id: 'APP-2026-3301',
    applicantName: 'Vikram Patel',
    declaredIncome: 720000,
    ocrIncome: 715000,
    deviceId: 'DEV-TAB-3301-F1',
    ipAddress: '122.168.44.201',
    pan: 'CJKVP3345N',
    phone: '+91 99887 66554',
    status: 'CLEARED',
    riskScore: 18,
    riskTier: 'LOW',
    redFlags: [],
    aiReviewerNote:
      'Low risk. Declared and OCR income align within 1%. Device and IP history show stable, long-tenure usage with no ring associations.',
    label: 'APP-2026-3301 — Vikram Patel (Low Risk: Clean Profile)',
  },
  {
    id: 'APP-2026-5520',
    applicantName: 'Priya Nair',
    declaredIncome: 1450000,
    ocrIncome: 880000,
    deviceId: 'DEV-EMULATOR-5520',
    ipAddress: '185.220.101.44',
    pan: 'DHLPN7788P',
    phone: '+91 90123 45678',
    status: 'FLAGGED',
    riskScore: 87,
    riskTier: 'HIGH',
    redFlags: [
      {
        code: 'INCOME_MISMATCH',
        label: 'Income Mismatch',
        evidence:
          'Declared income exceeds OCR salary by ₹5,70,000 (65% inflation).',
      },
      {
        code: 'EMULATOR_SIGNAL',
        label: 'Emulator / Virtual Device',
        evidence:
          'Device fingerprint matches known Android emulator signatures (Build.FINGERPRINT contains generic/sdk).',
      },
      {
        code: 'TOR_EXIT',
        label: 'Anonymized Network',
        evidence:
          'Source IP 185.220.101.44 resolves to a known Tor exit node.',
      },
    ],
    aiReviewerNote:
      'Critical risk. Emulator usage plus Tor exit IP and material income inflation indicate intentional obfuscation. Decline and escalate to fraud ops.',
    label: 'APP-2026-5520 — Priya Nair (High Risk: Emulator & Tor Exit)',
  },
  {
    id: 'APP-2026-7744',
    applicantName: 'Arjun Mehta',
    declaredIncome: 1100000,
    ocrIncome: 1085000,
    deviceId: 'DEV-MOB-7744-B9',
    ipAddress: '157.48.23.66',
    pan: 'EFGAM9012Q',
    phone: '+91 97654 32109',
    status: 'CLEARED',
    riskScore: 24,
    riskTier: 'LOW',
    redFlags: [
      {
        code: 'MINOR_OCR_VARIANCE',
        label: 'Minor OCR Variance',
        evidence:
          'OCR income differs from declared by ₹15,000 (1.4%) — within acceptable tolerance.',
      },
    ],
    aiReviewerNote:
      'Low residual risk. Minor OCR variance is within tolerance. No device or network anomalies detected. Safe to proceed with standard underwriting.',
    label: 'APP-2026-7744 — Arjun Mehta (Low Risk: Minor OCR Variance)',
  },
];

export const emptyApplicationForm = {
  applicantName: '',
  declaredIncome: '',
  ocrIncome: '',
  deviceId: '',
  ipAddress: '',
  pan: '',
  phone: '',
};

export function scenarioToFormData(scenario) {
  return {
    id: scenario.id,
    applicantName: scenario.applicantName,
    declaredIncome: scenario.declaredIncome,
    ocrIncome: scenario.ocrIncome,
    deviceId: scenario.deviceId,
    ipAddress: scenario.ipAddress,
    pan: scenario.pan || '',
    phone: scenario.phone || '',
  };
}

export function buildMockAnalysis(payload) {
  const declared = Number(payload.declaredIncome) || 0;
  const ocr = Number(payload.ocrIncome) || 0;
  const mismatchRatio = ocr > 0 ? (declared - ocr) / ocr : 0;

  const existing = mockScenarios.find(
    (s) => s.id === payload.id || s.applicantName === payload.applicantName
  );

  if (existing && Math.abs(existing.declaredIncome - declared) < 1) {
    return {
      applicationId: existing.id,
      applicantName: existing.applicantName,
      riskScore: existing.riskScore,
      riskTier: existing.riskTier,
      redFlags: existing.redFlags,
      aiReviewerNote: existing.aiReviewerNote,
      status: existing.status,
      analyzedAt: new Date().toISOString(),
      source: 'mock',
    };
  }

  const redFlags = [];
  let riskScore = 12;

  if (mismatchRatio > 0.25) {
    riskScore += Math.min(50, Math.round(mismatchRatio * 40));
    redFlags.push({
      code: 'INCOME_MISMATCH',
      label: 'Income Mismatch',
      evidence: `Declared income ₹${declared.toLocaleString('en-IN')} diverges ${Math.round(mismatchRatio * 100)}% from OCR income ₹${ocr.toLocaleString('en-IN')}.`,
    });
  }

  if (String(payload.deviceId || '').toUpperCase().includes('RING') ||
      String(payload.deviceId || '').toUpperCase().includes('EMULATOR')) {
    riskScore += 28;
    redFlags.push({
      code: 'DEVICE_ANOMALY',
      label: 'Device Anomaly',
      evidence: `Device ID "${payload.deviceId}" matches elevated-risk device patterns.`,
    });
  }

  if (String(payload.ipAddress || '').startsWith('185.220')) {
    riskScore += 20;
    redFlags.push({
      code: 'IP_ANOMALY',
      label: 'Suspicious IP',
      evidence: `IP ${payload.ipAddress} is associated with anonymized or high-risk network ranges.`,
    });
  }

  riskScore = Math.min(99, riskScore);
  const riskTier = riskScore >= 75 ? 'HIGH' : riskScore >= 40 ? 'MEDIUM' : 'LOW';
  const status = riskTier === 'HIGH' ? 'FLAGGED' : riskTier === 'MEDIUM' ? 'UNDER_REVIEW' : 'CLEARED';

  return {
    applicationId: payload.id || `APP-CUSTOM-${Date.now().toString().slice(-4)}`,
    applicantName: payload.applicantName || 'Unknown Applicant',
    riskScore,
    riskTier,
    redFlags,
    aiReviewerNote:
      riskTier === 'HIGH'
        ? 'Elevated fraud signals detected. Recommend decline pending deeper investigation.'
        : riskTier === 'MEDIUM'
          ? 'Mixed signals present. Route to a human analyst for secondary review.'
          : 'No material fraud indicators. Suitable for standard underwriting flow.',
    status,
    analyzedAt: new Date().toISOString(),
    source: 'mock',
  };
}

export function buildMockChatReply(applicationId, message) {
  const app =
    mockScenarios.find((s) => s.id === applicationId) || mockScenarios[0];
  const lower = (message || '').toLowerCase();

  if (lower.includes('high risk') || lower.includes('why')) {
    return {
      role: 'assistant',
      content: `Application **${app.id}** (${app.applicantName}) scored **${app.riskScore}/100 (${app.riskTier})**.\n\nPrimary drivers:\n${
        app.redFlags.length
          ? app.redFlags.map((f) => `• **${f.label}**: ${f.evidence}`).join('\n')
          : '• No major red flags on file.'
      }\n\n${app.aiReviewerNote}`,
      timestamp: new Date().toISOString(),
    };
  }

  if (lower.includes('income') || lower.includes('discrepancy')) {
    const delta = app.declaredIncome - app.ocrIncome;
    const pct =
      app.ocrIncome > 0
        ? Math.round((delta / app.ocrIncome) * 100)
        : 0;
    return {
      role: 'assistant',
      content: `Income discrepancy for **${app.id}**:\n• Declared: ₹${app.declaredIncome.toLocaleString('en-IN')}\n• OCR: ₹${app.ocrIncome.toLocaleString('en-IN')}\n• Delta: ₹${delta.toLocaleString('en-IN')} (${pct}%)\n\n${
        Math.abs(pct) > 25
          ? 'This exceeds the 25% tolerance band and contributes heavily to the risk score.'
          : 'Variance is within acceptable tolerance for this product segment.'
      }`,
      timestamp: new Date().toISOString(),
    };
  }

  if (lower.includes('device') || lower.includes('anomal')) {
    return {
      role: 'assistant',
      content: `Device anomalies for **${app.id}**:\n• Device ID: \`${app.deviceId}\`\n• Source IP: \`${app.ipAddress}\`\n\n${
        app.redFlags
          .filter((f) =>
            /device|ip|emulator|tor|ring/i.test(f.code + f.label)
          )
          .map((f) => `• **${f.label}**: ${f.evidence}`)
          .join('\n') || '• No device or network anomalies recorded for this application.'
      }`,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    role: 'assistant',
    content: `I've reviewed **${app.id} — ${app.applicantName}** (Risk: ${app.riskTier}, Score: ${app.riskScore}).\n\n${app.aiReviewerNote}\n\nAsk me about risk drivers, income discrepancy, or device anomalies for a deeper breakdown.`,
    timestamp: new Date().toISOString(),
  };
}

export default mockScenarios;
