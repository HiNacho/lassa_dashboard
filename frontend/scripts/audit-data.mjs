import fs from 'node:fs';
import Papa from 'papaparse';
import { validateNationalRows, validateStateRows } from '../src/lib/dataValidation.js';

const national = Papa.parse(fs.readFileSync(new URL('../public/dataset/lassa_fever_timeseries_full.csv', import.meta.url), 'utf8'), {
  header: true, dynamicTyping: true, skipEmptyLines: true,
});
const states = JSON.parse(fs.readFileSync(new URL('../public/dataset/lassa_state_data.json', import.meta.url), 'utf8'));
const nationalResult = validateNationalRows(national.data);
const stateResult = validateStateRows(states);
const years = [...new Set(national.data.map((row) => row.epi_year))].sort();
console.log(JSON.stringify({
  nationalRows: national.data.length,
  stateRows: states.length,
  years,
  parseErrors: national.errors,
  nationalValidationErrors: nationalResult.errors,
  stateValidationErrors: stateResult.errors,
}, null, 2));
process.exitCode = national.errors.length || nationalResult.errors.length || stateResult.errors.length ? 1 : 0;
