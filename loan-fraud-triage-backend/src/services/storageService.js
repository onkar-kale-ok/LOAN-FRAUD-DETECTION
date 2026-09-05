import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');

export const DATA_FILES = {
  dummy: path.join(dataDir, 'dummydata.json'),
  evaluations: path.join(dataDir, 'evaluation.json'),
};

/**
 * File read/write utility placeholder for JSON seed and persistence stores.
 */
export async function readJson(filePath, fallback = []) {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  return value;
}

export async function appendEvaluation(record) {
  const current = await readJson(DATA_FILES.evaluations, []);
  const list = Array.isArray(current) ? current : [];
  list.push(record);
  await writeJson(DATA_FILES.evaluations, list);
  return record;
}

export async function updateEvaluationById(applicationId, updater) {
  const current = await readJson(DATA_FILES.evaluations, []);
  const list = Array.isArray(current) ? current : [];
  const index = list.findIndex((row) => row?.applicationId === applicationId);
  if (index === -1) return null;
  const next = updater(list[index], index);
  list[index] = next;
  await writeJson(DATA_FILES.evaluations, list);
  return next;
}

export default { readJson, writeJson, appendEvaluation, updateEvaluationById, DATA_FILES };
