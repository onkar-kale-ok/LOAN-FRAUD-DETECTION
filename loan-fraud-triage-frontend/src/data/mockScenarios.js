/**
 * Seed mock loan applications for offline demo & scenario presets.
 * Canonical schema matches the AI Fraud Engine feature set.
 */

export const EMPLOYMENT_TYPES = ['Salaried', 'Self-Employed', 'Unemployed'];

export const mockScenarios = [
  {
    id: 'APP-2026-8842',
    applicationId: 'APP-2026-8842',
    applicantName: 'Rahul Sharma',
    panNumber: 'ABCDE1234F',
    phoneNumber: '+91 98765 43210',
    declaredIncome: 1800000,
    ocrBankIncome: 540000,
    deviceId: 'DEV-39482-PUN',
    ipAddress: '103.22.140.12',
    ipLocation: 'Pune, MH',
    deviceReuseCount: 5,
    isVpnOrProxy: true,
    employmentType: 'Salaried',
    companyName: 'TechSolutions Pvt Ltd',
    addressMatchScore: 42,
    documentTamperFlag: true,
    ocrExtractedAddress:
      'C/O R. Kulkarni, Lane 3, Viman Nagar, Pune, MH 411014',
    suspiciousMetadata:
      'PDF producer mismatch: Adobe Photoshop 24.0; CreationDate ≠ ModDate',
    bankStatementFileName: 'Rahul_Sharma_Bank_Statement.pdf',
    bankStatementFileSize: 1468006,
    bankStatementParsed: true,
    status: 'FLAGGED',
    riskScore: 92,
    riskTier: 'HIGH',
    redFlags: [
      {
        code: 'INCOME_MISMATCH',
        label: 'Income Mismatch',
        evidence:
          'Declared income ₹18,00,000 is 233% higher than OCR bank-statement income ₹5,40,000.',
      },
      {
        code: 'DEVICE_RING',
        label: 'Device Reuse Ring',
        evidence:
          'Device DEV-39482-PUN is tied to 5 distinct applications in the last 30 days.',
      },
      {
        code: 'VPN_PROXY',
        label: 'VPN / Proxy Active',
        evidence:
          'Request originated from a VPN/proxy on IP 103.22.140.12 (Pune, MH).',
      },
      {
        code: 'ADDRESS_MISMATCH',
        label: 'Low Address Match',
        evidence:
          'Declared address vs document OCR address match confidence is only 42%.',
      },
      {
        code: 'DOC_TAMPER',
        label: 'Document Tampering',
        evidence:
          'Optical/metadata checks flagged the uploaded documents as edited.',
      },
    ],
    aiReviewerNote:
      'High-confidence fraud pattern. Income inflation, device reuse, VPN obfuscation, weak address match, and document tampering together indicate coordinated identity abuse. Recommend hard decline and device blacklist.',
    label: 'Rahul Sharma — High Risk (Income Mismatch & Device Reuse)',
  },
  {
    id: 'APP-2026-1012',
    applicationId: 'APP-2026-1012',
    applicantName: 'Ananya Verma',
    panNumber: 'BGHPV8821M',
    phoneNumber: '+91 91234 56780',
    declaredIncome: 1200000,
    ocrBankIncome: 1200000,
    deviceId: 'DEV-MOB-1012-C3',
    ipAddress: '49.36.112.18',
    ipLocation: 'Bengaluru, KA',
    deviceReuseCount: 1,
    isVpnOrProxy: false,
    employmentType: 'Salaried',
    companyName: 'Nimbus Analytics Ltd',
    addressMatchScore: 98,
    documentTamperFlag: false,
    ocrExtractedAddress:
      'Ananya Verma, 18 Indiranagar 12th Main, Bengaluru, KA 560038',
    suspiciousMetadata: '',
    bankStatementFileName: 'Ananya_Verma_Bank_Statement.pdf',
    bankStatementFileSize: 982016,
    bankStatementParsed: true,
    status: 'CLEARED',
    riskScore: 14,
    riskTier: 'LOW',
    redFlags: [],
    aiReviewerNote:
      'Clean profile. Declared and OCR income match exactly, device history is single-use, no VPN/proxy, and document address confidence is 98% with no tamper signals. Suitable for standard underwriting.',
    label: 'Ananya Verma — Low Risk (Verified Clean Application)',
  },
  {
    id: 'APP-2026-3391',
    applicationId: 'APP-2026-3391',
    applicantName: 'Vikram Patel',
    panNumber: 'CJKVP3345N',
    phoneNumber: '+91 99887 66554',
    declaredIncome: 1600000,
    ocrBankIncome: 1100000,
    deviceId: 'DEV-TAB-3391-F1',
    ipAddress: '122.168.44.201',
    ipLocation: 'Ahmedabad, GJ',
    deviceReuseCount: 2,
    isVpnOrProxy: false,
    employmentType: 'Self-Employed',
    companyName: 'Patel Trading Co.',
    addressMatchScore: 60,
    documentTamperFlag: false,
    ocrExtractedAddress:
      'Vikram Patel, 9 CG Road, Navrangpura, Ahmedabad, GJ 380009',
    suspiciousMetadata: 'Embedded font subset incomplete; scanned pages mixed with digital overlay',
    bankStatementFileName: 'Vikram_Patel_Bank_Statement.pdf',
    bankStatementFileSize: 1212416,
    bankStatementParsed: true,
    status: 'UNDER_REVIEW',
    riskScore: 52,
    riskTier: 'MEDIUM',
    redFlags: [
      {
        code: 'INCOME_MISMATCH',
        label: 'Moderate Income Variance',
        evidence:
          'Declared income ₹16,00,000 is 45% above OCR bank income ₹11,00,000 — outside the 25% tolerance band.',
      },
      {
        code: 'ADDRESS_DRIFT',
        label: 'Address Match Gap',
        evidence:
          'Address match score is 60%, suggesting partial divergence between declared and document OCR addresses.',
      },
      {
        code: 'DEVICE_REUSE',
        label: 'Elevated Device Reuse',
        evidence:
          'Device DEV-TAB-3391-F1 is linked to 2 applications in the last 30 days.',
      },
    ],
    aiReviewerNote:
      'Medium risk / anomaly. Income variance and a 60% address match warrant manual review. Device reuse is modest and no VPN or tamper flags are present.',
    label: 'Vikram Patel — Medium Risk (Moderate Address Variance)',
  },
  {
    id: 'APP-2026-5520',
    applicationId: 'APP-2026-5520',
    applicantName: 'Priya Nair',
    panNumber: 'DHLPN7788P',
    phoneNumber: '+91 90123 45678',
    declaredIncome: 1450000,
    ocrBankIncome: 880000,
    deviceId: 'DEV-EMULATOR-5520',
    ipAddress: '185.220.101.44',
    ipLocation: 'Unknown (Tor Exit)',
    deviceReuseCount: 3,
    isVpnOrProxy: true,
    employmentType: 'Salaried',
    companyName: 'Coastal Foods Pvt Ltd',
    addressMatchScore: 51,
    documentTamperFlag: true,
    ocrExtractedAddress:
      'P. Nair, Temporary hostel, Ernakulam, KL 682011',
    suspiciousMetadata:
      'Exif metadata stripped; /Filter /FlateDecode overlay detected',
    bankStatementFileName: 'Priya_Nair_Bank_Statement.pdf',
    bankStatementFileSize: 2101248,
    bankStatementParsed: true,
    status: 'FLAGGED',
    riskScore: 87,
    riskTier: 'HIGH',
    redFlags: [
      {
        code: 'INCOME_MISMATCH',
        label: 'Income Mismatch',
        evidence:
          'Declared income exceeds OCR bank income by ₹5,70,000 (65% inflation).',
      },
      {
        code: 'EMULATOR_SIGNAL',
        label: 'Emulator / Virtual Device',
        evidence:
          'Device fingerprint matches known Android emulator signatures (Build.FINGERPRINT contains generic/sdk).',
      },
      {
        code: 'VPN_PROXY',
        label: 'Anonymized Network',
        evidence:
          'Source IP 185.220.101.44 resolves to a known Tor exit node (VPN/proxy active).',
      },
      {
        code: 'DOC_TAMPER',
        label: 'Document Tampering',
        evidence: 'Uploaded KYC documents show optical/metadata edit markers.',
      },
    ],
    aiReviewerNote:
      'Critical risk. Emulator usage, Tor exit IP, document tamper, and material income inflation indicate intentional obfuscation. Decline and escalate to fraud ops.',
    label: 'Priya Nair — High Risk (Emulator, Tor Exit & Tamper)',
  },
  {
    id: 'APP-2026-7744',
    applicationId: 'APP-2026-7744',
    applicantName: 'Arjun Mehta',
    panNumber: 'EFGAM9012Q',
    phoneNumber: '+91 97654 32109',
    declaredIncome: 1100000,
    ocrBankIncome: 1085000,
    deviceId: 'DEV-MOB-7744-B9',
    ipAddress: '157.48.23.66',
    ipLocation: 'Jaipur, RJ',
    deviceReuseCount: 1,
    isVpnOrProxy: false,
    employmentType: 'Salaried',
    companyName: 'Mehta Logistics LLP',
    addressMatchScore: 94,
    documentTamperFlag: false,
    ocrExtractedAddress:
      'Arjun Mehta, 22 C-Scheme, Jaipur, RJ 302001',
    suspiciousMetadata: '',
    bankStatementFileName: 'Arjun_Mehta_Bank_Statement.pdf',
    bankStatementFileSize: 890880,
    bankStatementParsed: true,
    status: 'CLEARED',
    riskScore: 24,
    riskTier: 'LOW',
    redFlags: [
      {
        code: 'MINOR_OCR_VARIANCE',
        label: 'Minor OCR Variance',
        evidence:
          'OCR bank income differs from declared by ₹15,000 (1.4%) — within acceptable tolerance.',
      },
    ],
    aiReviewerNote:
      'Low residual risk. Minor OCR variance is within tolerance. Device reuse, VPN, address match, and tamper checks are clean. Safe to proceed with standard underwriting.',
    label: 'Arjun Mehta — Low Risk (Minor OCR Variance)',
  },
];

export const emptyBankStatementFields = {
  ocrBankIncome: '',
  ocrExtractedAddress: '',
  addressMatchScore: '',
  documentTamperFlag: false,
  suspiciousMetadata: '',
  bankStatementFileName: '',
  bankStatementFileSize: '',
  bankStatementParsed: false,
  bankStatementMock: false,
};

export const emptyApplicationForm = {
  applicantName: '',
  panNumber: '',
  phoneNumber: '',
  email: '',
  declaredAddress: '',
  employmentType: 'Salaried',
  declaredIncome: '',
  ocrBankIncome: '',
  bankStatementSummary: '',
  applicationTimestamp: '',
  deviceId: '',
  ipAddress: '',
  ipLocation: '',
  deviceReuseCount: '',
  isVpnOrProxy: false,
  companyName: '',
  addressMatchScore: '',
  documentTamperFlag: false,
  ocrExtractedAddress: '',
  suspiciousMetadata: '',
  bankStatementFileName: '',
  bankStatementFileSize: '',
  bankStatementParsed: false,
  bankStatementMock: false,
};

function toBool(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const lower = value.trim().toLowerCase();
    return lower === 'true' || lower === '1' || lower === 'yes';
  }
  return false;
}

function toNumberOrEmpty(value) {
  if (value === '' || value === null || value === undefined) return '';
  const n = Number(value);
  return Number.isNaN(n) ? '' : n;
}

export function coerceApplicationPayload(raw = {}) {
  const applicationId = raw.applicationId || raw.id || '';
  return {
    applicationId,
    id: applicationId,
    applicantName: raw.applicantName || '',
    panNumber: raw.panNumber || raw.pan || '',
    phoneNumber: raw.phoneNumber || raw.phone || '',
    email: raw.email || '',
    declaredAddress: raw.declaredAddress || raw.address || '',
    bankStatementSummary: raw.bankStatementSummary || '',
    applicationTimestamp: raw.applicationTimestamp || '',
    employmentType: EMPLOYMENT_TYPES.includes(raw.employmentType)
      ? raw.employmentType
      : raw.employmentType || 'Salaried',
    declaredIncome: Number(raw.declaredIncome) || 0,
    ocrBankIncome: Number(raw.ocrBankIncome ?? raw.ocrIncome) || 0,
    deviceId: raw.deviceId || '',
    ipAddress: raw.ipAddress || '',
    ipLocation: raw.ipLocation || '',
    deviceReuseCount: Number(raw.deviceReuseCount) || 0,
    isVpnOrProxy: toBool(raw.isVpnOrProxy),
    companyName: raw.companyName || '',
    addressMatchScore: Number(raw.addressMatchScore) || 0,
    documentTamperFlag: toBool(raw.documentTamperFlag),
    ocrExtractedAddress: raw.ocrExtractedAddress || '',
    suspiciousMetadata: raw.suspiciousMetadata || '',
    bankStatementFileName: raw.bankStatementFileName || '',
    bankStatementFileSize: Number(raw.bankStatementFileSize) || 0,
    bankStatementParsed: toBool(raw.bankStatementParsed),
  };
}

export function scenarioToFormData(scenario) {
  return {
    applicantName: scenario.applicantName || '',
    panNumber: scenario.panNumber || scenario.pan || '',
    phoneNumber: scenario.phoneNumber || scenario.phone || '',
    email: scenario.email || '',
    declaredAddress: scenario.declaredAddress || scenario.address || '',
    bankStatementSummary: scenario.bankStatementSummary || '',
    applicationTimestamp: scenario.applicationTimestamp || '',
    employmentType: scenario.employmentType || 'Salaried',
    declaredIncome: scenario.declaredIncome ?? '',
    ocrBankIncome: scenario.ocrBankIncome ?? scenario.ocrIncome ?? '',
    deviceId: scenario.deviceId || '',
    ipAddress: scenario.ipAddress || '',
    ipLocation: scenario.ipLocation || '',
    deviceReuseCount: scenario.deviceReuseCount ?? '',
    isVpnOrProxy: toBool(scenario.isVpnOrProxy),
    companyName: scenario.companyName || '',
    addressMatchScore: scenario.addressMatchScore ?? '',
    documentTamperFlag: toBool(scenario.documentTamperFlag),
    ocrExtractedAddress: scenario.ocrExtractedAddress || '',
    suspiciousMetadata: scenario.suspiciousMetadata || '',
    bankStatementFileName: scenario.bankStatementFileName || '',
    bankStatementFileSize: scenario.bankStatementFileSize ?? '',
    bankStatementParsed: toBool(scenario.bankStatementParsed),
  };
}

export function serializeFormForJson(formData = {}) {
  return {
    applicantName: formData.applicantName || '',
    panNumber: formData.panNumber || '',
    phoneNumber: formData.phoneNumber || '',
    email: formData.email || '',
    declaredAddress: formData.declaredAddress || '',
    bankStatementSummary: formData.bankStatementSummary || '',
    applicationTimestamp: formData.applicationTimestamp || '',
    employmentType: formData.employmentType || 'Salaried',
    declaredIncome: toNumberOrEmpty(formData.declaredIncome),
    ocrBankIncome: toNumberOrEmpty(formData.ocrBankIncome),
    deviceId: formData.deviceId || '',
    ipAddress: formData.ipAddress || '',
    ipLocation: formData.ipLocation || '',
    deviceReuseCount: toNumberOrEmpty(formData.deviceReuseCount),
    isVpnOrProxy: toBool(formData.isVpnOrProxy),
    companyName: formData.companyName || '',
    addressMatchScore: toNumberOrEmpty(formData.addressMatchScore),
    documentTamperFlag: toBool(formData.documentTamperFlag),
    ocrExtractedAddress: formData.ocrExtractedAddress || '',
    suspiciousMetadata: formData.suspiciousMetadata || '',
    bankStatementFileName: formData.bankStatementFileName || '',
    bankStatementFileSize: toNumberOrEmpty(formData.bankStatementFileSize),
    bankStatementParsed: toBool(formData.bankStatementParsed),
    bankStatementMock: toBool(formData.bankStatementMock),
  };
}

export function buildMockChatReply(applicationId, message) {
  const app =
    mockScenarios.find(
      (s) => s.id === applicationId || s.applicationId === applicationId
    ) || mockScenarios[0];
  const lower = (message || '').toLowerCase();
  const appId = app.applicationId || app.id;
  const ocr = app.ocrBankIncome ?? app.ocrIncome;

  if (lower.includes('high risk') || lower.includes('why')) {
    return {
      role: 'assistant',
      content: `Application **${appId}** (${app.applicantName}) scored **${app.riskScore}/100 (${app.riskTier})**.\n\nPrimary drivers:\n${
        app.redFlags.length
          ? app.redFlags.map((f) => `• **${f.label}**: ${f.evidence}`).join('\n')
          : '• No major red flags on file.'
      }\n\n${app.aiReviewerNote}`,
      timestamp: new Date().toISOString(),
    };
  }

  if (lower.includes('income') || lower.includes('discrepancy')) {
    const delta = app.declaredIncome - ocr;
    const pct = ocr > 0 ? Math.round((delta / ocr) * 100) : 0;
    return {
      role: 'assistant',
      content: `Income discrepancy for **${appId}**:\n• Declared: ₹${app.declaredIncome.toLocaleString('en-IN')}\n• OCR bank income: ₹${ocr.toLocaleString('en-IN')}\n• Delta: ₹${delta.toLocaleString('en-IN')} (${pct}%)\n\n${
        Math.abs(pct) > 25
          ? 'This exceeds the 25% tolerance band and contributes heavily to the risk score.'
          : 'Variance is within acceptable tolerance for this product segment.'
      }`,
      timestamp: new Date().toISOString(),
    };
  }

  if (lower.includes('rejection') || lower.includes('reject')) {
    return {
      role: 'assistant',
      content: `**Draft Formal Rejection Letter — ${appId}**\n\nDear ${app.applicantName},\n\nAfter a comprehensive fraud-risk evaluation of application **${appId}**, we are unable to proceed with this loan request at this time.\n\nPrimary findings:\n${
        app.redFlags.length
          ? app.redFlags.map((f) => `• ${f.label}: ${f.evidence}`).join('\n')
          : '• Residual risk indicators identified during automated underwriting.'
      }\n\nRisk rating: **${app.riskScore}/100 (${app.riskTier})**. This decision is based on documentary, device, and income-verification signals and does not constitute a credit-bureau listing.\n\nYou may re-apply after addressing the discrepancies noted above.\n\nSincerely,\nFraud Risk Operations`,
      timestamp: new Date().toISOString(),
    };
  }

  if (lower.includes('network graph') || lower.includes('device network')) {
    return {
      role: 'assistant',
      content: `**Device Network Graph — ${appId}**\n\n\`[${app.applicantName}]\`\n    └── device \`${app.deviceId}\`  (reuse: ${app.deviceReuseCount} in 30d)\n            ├── IP \`${app.ipAddress}\` (${app.ipLocation || 'unknown'})${
        app.isVpnOrProxy ? '  · VPN/Proxy' : ''
      }\n            ├── linked applications: ${Math.max(1, app.deviceReuseCount || 1)}\n            └── statement: ${app.bankStatementFileName || 'not attached'}${
        app.documentTamperFlag ? '  · TAMPER FLAG' : ''
      }\n\nInterpretation: ${
        (app.deviceReuseCount || 0) >= 4
          ? 'This fingerprint sits in a **high-reuse cluster**. Treat sibling applications as a coordinated ring until identities are independently verified.'
          : (app.deviceReuseCount || 0) >= 2
            ? 'Moderate reuse. Review sibling filings before approval.'
            : 'Single-use device with no ring edges detected.'
      }`,
      timestamp: new Date().toISOString(),
    };
  }

  if (lower.includes('device') || lower.includes('anomal') || lower.includes('vpn')) {
    return {
      role: 'assistant',
      content: `Device & network telemetry for **${appId}**:\n• Device ID: \`${app.deviceId}\`\n• Source IP: \`${app.ipAddress}\` (${app.ipLocation || 'unknown location'})\n• Device reuse (30d): **${app.deviceReuseCount}**\n• VPN/Proxy: **${app.isVpnOrProxy ? 'Yes' : 'No'}**\n\n${
        app.redFlags
          .filter((f) =>
            /device|ip|emulator|tor|ring|vpn|proxy/i.test(f.code + f.label)
          )
          .map((f) => `• **${f.label}**: ${f.evidence}`)
          .join('\n') || '• No device or network anomalies recorded for this application.'
      }`,
      timestamp: new Date().toISOString(),
    };
  }

  if (lower.includes('document') || lower.includes('address') || lower.includes('tamper')) {
    return {
      role: 'assistant',
      content: `Document & verification signals for **${appId}**:\n• Statement: ${app.bankStatementFileName || 'not attached'}\n• OCR address: ${app.ocrExtractedAddress || '—'}\n• Address match: **${app.addressMatchScore}%**\n• Document tamper flag: **${app.documentTamperFlag ? 'Detected' : 'Clear'}**\n• Metadata: ${app.suspiciousMetadata || 'none'}\n\n${app.aiReviewerNote}`,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    role: 'assistant',
    content: `I've reviewed **${appId} — ${app.applicantName}** (Risk: ${app.riskTier}, Score: ${app.riskScore}).\n\n${app.aiReviewerNote}\n\nAsk me about risk drivers, income discrepancy, device anomalies, or document signals for a deeper breakdown.`,
    timestamp: new Date().toISOString(),
  };
}

export default mockScenarios;
