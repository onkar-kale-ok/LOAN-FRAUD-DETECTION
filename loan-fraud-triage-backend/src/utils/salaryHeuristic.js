const EMPLOYMENT_TYPES = ['Salaried', 'Self-Employed', 'Unemployed'];

/**
 * Role-aware salary check: unusually high declared income vs employment type.
 * Suspicion only — not confirmed fraud.
 */
export function assessSalaryVsRole({ employmentType, declaredIncome, companyName }) {
  const type = EMPLOYMENT_TYPES.includes(employmentType) ? employmentType : 'Salaried';
  const income = Number(declaredIncome) || 0;
  const company = String(companyName || '').trim();

  let threshold = 4000000;
  if (type === 'Unemployed') threshold = 300000;
  if (type === 'Self-Employed') threshold = 5000000;

  const flagged = income >= threshold;
  const evidence = flagged
    ? `Declared income ₹${income.toLocaleString('en-IN')} is unusually high for ${type}${
        company ? ` at ${company}` : ''
      } (threshold ₹${threshold.toLocaleString('en-IN')}).`
    : `Declared income is within the ${type} band used for this prototype.`;

  return {
    employmentType: type,
    declaredIncome: income,
    threshold,
    flagged,
    code: 'HIGH_SALARY_VS_ROLE',
    evidence,
  };
}

export default { assessSalaryVsRole };
