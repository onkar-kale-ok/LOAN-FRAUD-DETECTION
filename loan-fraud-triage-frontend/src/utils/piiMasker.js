/**
 * Role-based PII masking helpers.
 * ANALYST → full identifiers visible
 * GUEST   → masked PAN / phone / name
 */

export function maskPan(pan = '') {
  const value = String(pan);
  if (value.length < 5) return '••••••••••';
  return `${value.slice(0, 2)}${'•'.repeat(Math.max(4, value.length - 5))}${value.slice(-3)}`;
}

export function maskPhone(phone = '') {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length < 4) return '••••••••••';
  return `+•• ••••• ${digits.slice(-4)}`;
}

export function maskName(name = '', role = 'ANALYST') {
  if (role !== 'GUEST') return name;
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return `${parts[0].slice(0, 1)}••••`;
  return `${parts[0]} ${parts[parts.length - 1].slice(0, 1)}.`;
}

export function maskDeviceId(deviceId = '', role = 'ANALYST') {
  if (role !== 'GUEST') return deviceId;
  const value = String(deviceId);
  if (value.length <= 6) return '••••••';
  return `${value.slice(0, 4)}••••${value.slice(-2)}`;
}

export function maskIp(ip = '', role = 'ANALYST') {
  if (role !== 'GUEST') return ip;
  const parts = String(ip).split('.');
  if (parts.length !== 4) return '•••.•••.•••.•••';
  return `${parts[0]}.${parts[1]}.•••.•••`;
}

/**
 * Returns a display-safe copy of an application based on RBAC role.
 */
export function maskApplication(application, role = 'ANALYST') {
  if (!application || role === 'ANALYST') return application;

  const pan = application.panNumber || application.pan;
  const phone = application.phoneNumber || application.phone;
  const maskedPan = maskPan(pan);
  const maskedPhone = maskPhone(phone);

  return {
    ...application,
    applicantName: maskName(application.applicantName, role),
    pan: maskedPan,
    panNumber: maskedPan,
    phone: maskedPhone,
    phoneNumber: maskedPhone,
    deviceId: maskDeviceId(application.deviceId, role),
    ipAddress: maskIp(application.ipAddress, role),
  };
}

export default {
  maskPan,
  maskPhone,
  maskName,
  maskDeviceId,
  maskIp,
  maskApplication,
};
