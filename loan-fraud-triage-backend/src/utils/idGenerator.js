/**
 * Unique application IDs in APP-YYYY-XXXX format.
 * Serials increment from existing evaluation.json records for the current year.
 */
export function generateApplicationId(existingRecords = [], date = new Date()) {
  const year = date.getFullYear();
  const prefix = `APP-${year}-`;
  let next = 1001;

  const records = Array.isArray(existingRecords) ? existingRecords : [];
  for (const record of records) {
    const id = String(record?.applicationId || '');
    if (!id.startsWith(prefix)) continue;
    const serial = Number.parseInt(id.slice(prefix.length), 10);
    if (Number.isFinite(serial) && serial >= next) {
      next = serial + 1;
    }
  }

  if (next > 9999) {
    next = 1000 + Math.floor(Math.random() * 9000);
  }

  return `${prefix}${String(next).padStart(4, '0')}`;
}

export default { generateApplicationId };
