import { caseFatalityRate, sumObserved } from './epidemiology';

export const NATIONAL_METRICS = ['suspected_cases', 'confirmed_cases', 'probable_cases', 'deaths'];

export function filterByEpiYear(rows, year) {
  return year === 'All' ? rows : rows.filter((row) => row.epi_year === year);
}

export function summarizeNational(rows) {
  const summary = Object.fromEntries(NATIONAL_METRICS.map((metric) => [metric, sumObserved(rows, metric)]));
  return { ...summary, cfr: caseFatalityRate(summary.deaths, summary.confirmed_cases) };
}

export function groupByCalendarMonth(rows) {
  const groups = new Map();
  rows.forEach((row) => {
    if (!row.week_start_date || Number.isNaN(Date.parse(`${row.week_start_date}T00:00:00Z`))) return;
    const key = row.week_start_date.slice(0, 7);
    const group = groups.get(key) || [];
    group.push(row);
    groups.set(key, group);
  });
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, records]) => ({
      name: month,
      cases: sumObserved(records, 'confirmed_cases'),
      deaths: sumObserved(records, 'deaths'),
      recordCount: records.length,
    }));
}
