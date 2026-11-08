const requiredNationalFields = ['week_start_date', 'week_end_date', 'epi_year', 'epi_week', 'suspected_cases', 'confirmed_cases', 'probable_cases', 'deaths'];

function parseIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : null;
}

export function validateNationalRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return { valid: [], errors: ['National dataset is empty.'] };
  const errors = [];
  const periods = new Set();
  const valid = rows.filter((row, index) => {
    const label = `Row ${index + 2}`;
    const missing = requiredNationalFields.filter((field) => row[field] === null || row[field] === undefined || row[field] === '');
    if (missing.length) { errors.push(`${label}: missing ${missing.join(', ')}.`); return false; }
    const numeric = ['epi_year', 'epi_week', 'suspected_cases', 'confirmed_cases', 'probable_cases', 'deaths'];
    if (numeric.some((field) => !Number.isFinite(row[field]) || row[field] < 0 || !Number.isInteger(row[field]))) {
      errors.push(`${label}: count or epidemiological fields are invalid.`); return false;
    }
    const start = parseIsoDate(row.week_start_date);
    const end = parseIsoDate(row.week_end_date);
    const durationDays = start && end ? (end.getTime() - start.getTime()) / 86400000 : null;
    if (row.epi_week < 1 || row.epi_week > 53 || !start || !end || durationDays !== 6) {
      errors.push(`${label}: reporting dates or epidemiological week are invalid.`); return false;
    }
    const period = `${row.epi_year}-${row.epi_week}`;
    if (periods.has(period)) { errors.push(`${label}: duplicate epidemiological reporting period ${period}.`); return false; }
    periods.add(period);
    return true;
  });
  return { valid, errors };
}

export function validateStateRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return { valid: [], errors: ['State dataset is empty.'] };
  const errors = [];
  const valid = rows.filter((row, index) => {
    const fields = ['state_clean', 'year', 'suspected', 'confirmed', 'probable', 'deaths'];
    if (fields.some((field) => row[field] === null || row[field] === undefined || row[field] === '')) {
      errors.push(`State row ${index + 1}: required field is missing.`); return false;
    }
    if (['suspected', 'confirmed', 'probable', 'deaths'].some((field) => !Number.isFinite(row[field]) || row[field] < 0 || !Number.isInteger(row[field]))) {
      errors.push(`State row ${index + 1}: count field is invalid.`); return false;
    }
    return true;
  });
  return { valid, errors };
}
