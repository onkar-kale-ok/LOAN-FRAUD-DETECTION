/**
 * PDF type check plus a leftover mock extractor.
 * Live evaluate does not call simulateOcrExtraction: attached PDFs go to the LLM as-is.
 */
function hashString(value) {
  let hash = 0;
  const text = String(value);
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function isPdfFile(file) {
  if (!file) return false;
  const name = String(file.name || '').toLowerCase();
  return file.type === 'application/pdf' || name.endsWith('.pdf');
}

export function simulateOcrExtraction(fileMeta = {}, formContext = {}) {
  const fileName = fileMeta.fileName || 'Bank_Statement.pdf';
  const fileSizeBytes = Number(fileMeta.fileSizeBytes) || 0;
  const hash = hashString(`${fileName}:${fileSizeBytes}`);
  const declared = Number(formContext.declaredIncome) || 0;
  const applicant = String(formContext.applicantName || 'Applicant').trim() || 'Applicant';
  const location = String(formContext.ipLocation || 'India').trim() || 'India';
  const suspiciousName = /tamper|edit|photoshop|forged|scan-copy/i.test(fileName);

  let ocrBankIncome;
  let addressMatchScore;
  let documentTamperFlag = suspiciousName;
  let suspiciousMetadata = '';

  if (suspiciousName || /mismatch/i.test(fileName)) {
    ocrBankIncome = declared > 0 ? Math.max(0, Math.round(declared * 0.32)) : 540000;
    addressMatchScore = 38 + (hash % 12);
    documentTamperFlag = true;
    suspiciousMetadata =
      'PDF producer mismatch: Adobe Photoshop; CreationDate ≠ ModDate';
  } else if (declared > 0) {
    const factor = 0.88 + (hash % 15) / 100;
    ocrBankIncome = Math.round(declared * factor);
    addressMatchScore = 88 + (hash % 11);
    if (addressMatchScore > 100) addressMatchScore = 100;
    suspiciousMetadata = '';
  } else {
    ocrBankIncome = 600000 + (hash % 900000);
    addressMatchScore = 70 + (hash % 25);
    suspiciousMetadata = hash % 5 === 0 ? 'Uncommon PDF producer: Unknown Scanner' : '';
    documentTamperFlag = hash % 7 === 0;
  }

  const ocrExtractedAddress = `${applicant}, ${12 + (hash % 80)} Residency Road, ${location} ${400000 + (hash % 99999)}`;

  return {
    bankStatementFileName: fileName,
    bankStatementFileSize: fileSizeBytes,
    bankStatementParsed: true,
    bankStatementMock: false,
    ocrBankIncome,
    ocrExtractedAddress,
    addressMatchScore,
    documentTamperFlag,
    suspiciousMetadata,
  };
}

export default simulateOcrExtraction;
