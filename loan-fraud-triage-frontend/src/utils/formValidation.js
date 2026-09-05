const EMPLOYMENT_TYPES = ['Salaried', 'Self-Employed', 'Unemployed'];

export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const IPV4_REGEX =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
export const PHONE_REGEX = /^\+?[0-9]{10,12}$/;
export const NAME_REGEX = /^[a-zA-Z\s-]{2,50}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MESSAGES = {
  panNumber: 'Invalid PAN format (e.g., ABCDE1234F).',
  ipAddress: 'Please enter a valid IPv4 address (e.g., 103.22.140.12).',
  phoneNumber: 'Please enter a valid 10 to 12 digit phone number.',
  declaredIncome: 'Declared income must be between ₹10,000 and ₹10 Crore.',
  ocrBankIncome: 'OCR income must be a valid non-negative amount.',
  addressMatchScore: 'Address match score must be a percentage between 0 and 100.',
  deviceReuseCount: 'Reuse count must be an integer between 0 and 50.',
  email: 'Please enter a valid email address.',
  applicantName: 'Full name must contain only letters and spaces (2-50 chars).',
  deviceId: 'Device ID must be at least 5 characters (e.g., DEV-39482-PUN).',
  ipLocation: 'IP Location is required.',
  companyName: 'Company name is required for employed applicants.',
  employmentType: 'Employment type must be Salaried, Self-Employed, or Unemployed.',
};

const INCOME_MAX = 100000000;
const DECLARED_MIN = 10000;
const REQUIRED_FIELDS = [
  'applicantName',
  'panNumber',
  'phoneNumber',
  'email',
  'declaredIncome',
  'ocrBankIncome',
  'addressMatchScore',
  'deviceReuseCount',
  'deviceId',
  'ipAddress',
  'ipLocation',
  'employmentType',
];

export function normalizePhone(value) {
  return String(value ?? '').replace(/[\s\-()]/g, '');
}

function isBlank(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  return false;
}

function asNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() === '') return NaN;
  return Number(value);
}

function isIntegerValue(value) {
  if (typeof value === 'number') return Number.isInteger(value);
  if (typeof value === 'string' && /^-?\d+$/.test(value.trim())) return true;
  return false;
}

export function requiresCompanyName(employmentType) {
  return employmentType === 'Salaried' || employmentType === 'Self-Employed';
}

export function validateField(field, value, formData = {}) {
  switch (field) {
    case 'panNumber': {
      const pan = String(value ?? '')
        .trim()
        .toUpperCase();
      if (!pan || !PAN_REGEX.test(pan)) return MESSAGES.panNumber;
      return '';
    }
    case 'ipAddress': {
      const ip = String(value ?? '').trim();
      if (!ip || !IPV4_REGEX.test(ip)) return MESSAGES.ipAddress;
      return '';
    }
    case 'phoneNumber': {
      const phone = normalizePhone(value);
      if (!phone || !PHONE_REGEX.test(phone)) return MESSAGES.phoneNumber;
      return '';
    }
    case 'email': {
      const email = String(value ?? '').trim();
      if (!email || !EMAIL_REGEX.test(email)) return MESSAGES.email;
      return '';
    }
    case 'declaredIncome': {
      const n = asNumber(value);
      if (!Number.isFinite(n) || n < DECLARED_MIN || n > INCOME_MAX) {
        return MESSAGES.declaredIncome;
      }
      return '';
    }
    case 'ocrBankIncome': {
      const n = asNumber(value);
      if (!Number.isFinite(n) || n < 0 || n > INCOME_MAX) {
        return MESSAGES.ocrBankIncome;
      }
      return '';
    }
    case 'addressMatchScore': {
      const n = asNumber(value);
      if (!isIntegerValue(value) || !Number.isFinite(n) || n < 0 || n > 100) {
        return MESSAGES.addressMatchScore;
      }
      return '';
    }
    case 'deviceReuseCount': {
      const n = asNumber(value);
      if (!isIntegerValue(value) || !Number.isFinite(n) || n < 0 || n > 50) {
        return MESSAGES.deviceReuseCount;
      }
      return '';
    }
    case 'applicantName': {
      const name = String(value ?? '').trim();
      if (!NAME_REGEX.test(name)) return MESSAGES.applicantName;
      return '';
    }
    case 'deviceId': {
      const id = String(value ?? '').trim();
      const alnum = id.replace(/[-_]/g, '');
      if (id.length < 5 || alnum.length < 5 || !/^[A-Za-z0-9_-]+$/.test(id)) {
        return MESSAGES.deviceId;
      }
      return '';
    }
    case 'ipLocation': {
      if (String(value ?? '').trim().length < 2) return MESSAGES.ipLocation;
      return '';
    }
    case 'companyName': {
      if (!requiresCompanyName(formData.employmentType)) return '';
      if (isBlank(value) || String(value).trim().length < 2) {
        return MESSAGES.companyName;
      }
      return '';
    }
    case 'employmentType': {
      if (!EMPLOYMENT_TYPES.includes(value)) return MESSAGES.employmentType;
      return '';
    }
    default:
      return '';
  }
}

export function validateForm(formData = {}) {
  const errors = {};
  const fields = [...REQUIRED_FIELDS, 'companyName'];
  for (const field of fields) {
    const message = validateField(field, formData[field], formData);
    if (message) errors[field] = message;
  }
  return errors;
}

export function reconcileFieldError(errors, field, formData) {
  const next = { ...errors };
  if (next[field]) {
    const message = validateField(field, formData[field], formData);
    if (message) next[field] = message;
    else delete next[field];
  }
  if (field === 'employmentType' && next.companyName) {
    const message = validateField('companyName', formData.companyName, formData);
    if (message) next.companyName = message;
    else delete next.companyName;
  }
  return next;
}

export function hasValidationErrors(errors = {}) {
  return Object.keys(errors).length > 0;
}

export default {
  validateField,
  validateForm,
  reconcileFieldError,
};
