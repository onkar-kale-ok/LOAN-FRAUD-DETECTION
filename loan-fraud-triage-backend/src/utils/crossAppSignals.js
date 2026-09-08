function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

function norm(value) {
  return String(value || '').trim().toLowerCase();
}

function applicantOf(record) {
  return record?.applicant || record?.evaluationResult || {};
}

function telemetryOf(record) {
  return record?.telemetry || {};
}

function documentOf(record) {
  return record?.documentOcr || {};
}

/**
 * Scan stored evaluations for shared device, phone, email, address, employer.
 * Current application is included in device reuse (count = 1 + prior matches).
 */
export function buildCrossAppSignals(inputData, existingRecords = []) {
  const list = Array.isArray(existingRecords) ? existingRecords : [];
  const phone = digitsOnly(inputData?.applicant?.phone);
  const email = norm(inputData?.applicant?.email);
  const deviceId = norm(inputData?.telemetry?.deviceId);
  const address = norm(inputData?.applicant?.address);
  const employer = norm(inputData?.applicant?.companyName);

  const deviceHits = [];
  const phoneHits = [];
  const emailHits = [];
  const addressHits = [];
  const employerHits = [];

  for (const record of list) {
    const id = record.applicationId;
    if (!id) continue;
    const applicant = applicantOf(record);
    const telemetry = telemetryOf(record);
    const documentOcr = documentOf(record);

    const recPhone = digitsOnly(applicant.phone || applicant.phoneNumber);
    const recEmail = norm(applicant.email);
    const recDevice = norm(telemetry.deviceId || record.evaluationResult?.deviceId);
    const recAddress = norm(applicant.address || documentOcr.ocrExtractedAddress);
    const recEmployer = norm(applicant.companyName);

    if (deviceId && recDevice && recDevice === deviceId) {
      deviceHits.push(id);
    }
    if (phone && recPhone && recPhone === phone) {
      phoneHits.push(id);
    }
    if (email && recEmail && recEmail === email) {
      emailHits.push(id);
    }
    if (address.length >= 8 && recAddress && recAddress === address) {
      addressHits.push(id);
    }
    if (employer.length >= 3 && recEmployer && recEmployer === employer) {
      employerHits.push(id);
    }
  }

  const reportedReuse = Number(inputData?.telemetry?.deviceReuseCount) || 0;
  const computedDeviceReuseCount = deviceHits.length + 1;

  return {
    computedDeviceReuseCount,
    reportedDeviceReuseCount: reportedReuse,
    deviceMatches: deviceHits,
    phoneMatches: phoneHits,
    emailMatches: emailHits,
    addressMatches: addressHits,
    employerMatches: employerHits,
    duplicatePhone: phoneHits.length > 0,
    duplicateEmail: emailHits.length > 0,
  };
}

function addEdge(edges, from, to, type, label) {
  if (!from || !to || from === to) return;
  const key = [from, to].sort().join('|') + '|' + type;
  if (edges.has(key)) return;
  edges.set(key, { from, to, type, label });
}

/**
 * Nodes + edges for the network UI (shared device, phone, email, address, employer).
 */
export function buildFraudNetwork(records = []) {
  const list = Array.isArray(records) ? records : [];
  const nodes = list.map((record) => {
    const applicant = applicantOf(record);
    return {
      id: record.applicationId,
      applicantName: applicant.name || record.evaluationResult?.applicantName || 'Unknown',
      companyName: applicant.companyName || '',
      riskTier: record.riskTier || record.evaluationResult?.riskTier || null,
      riskScore: record.riskScore ?? record.evaluationResult?.riskScore ?? null,
      deviceId: telemetryOf(record).deviceId || '',
      phone: applicant.phone || applicant.phoneNumber || '',
      email: applicant.email || '',
      address: applicant.address || '',
    };
  });

  const edges = new Map();
  for (let i = 0; i < list.length; i += 1) {
    for (let j = i + 1; j < list.length; j += 1) {
      const a = list[i];
      const b = list[j];
      const aa = applicantOf(a);
      const ab = applicantOf(b);
      const da = norm(telemetryOf(a).deviceId);
      const db = norm(telemetryOf(b).deviceId);
      if (da && da === db) {
        addEdge(edges, a.applicationId, b.applicationId, 'device', telemetryOf(a).deviceId);
      }
      const pa = digitsOnly(aa.phone || aa.phoneNumber);
      const pb = digitsOnly(ab.phone || ab.phoneNumber);
      if (pa && pa === pb) {
        addEdge(edges, a.applicationId, b.applicationId, 'phone', 'shared phone');
      }
      const ea = norm(aa.email);
      const eb = norm(ab.email);
      if (ea && ea === eb) {
        addEdge(edges, a.applicationId, b.applicationId, 'email', 'shared email');
      }
      const ada = norm(aa.address);
      const adb = norm(ab.address);
      if (ada.length >= 8 && ada === adb) {
        addEdge(edges, a.applicationId, b.applicationId, 'address', 'shared address');
      }
      const ca = norm(aa.companyName);
      const cb = norm(ab.companyName);
      if (ca.length >= 3 && ca === cb) {
        addEdge(edges, a.applicationId, b.applicationId, 'employer', aa.companyName);
      }
    }
  }

  return {
    nodes,
    edges: [...edges.values()],
    counts: {
      nodes: nodes.length,
      edges: edges.size,
    },
  };
}

export default { buildCrossAppSignals, buildFraudNetwork };
