/**
 * Deterministic display-only projection. This is deliberately not a statistical
 * forecast and the range it returns is not a confidence or prediction interval.
 */
export function buildIndicativeProjection(rows, horizon = 12) {
  const base = [...rows]
    .filter((row) => Number.isFinite(row.confirmed_cases) && row.week_start_date)
    .sort((a, b) => a.week_start_date.localeCompare(b.week_start_date));
  if (!base.length) return [];
  const last = base.at(-1);
  const lastDate = new Date(`${last.week_end_date || ''}T00:00:00Z`);
  if (Number.isNaN(lastDate.getTime())) return [];
  const projected = base.map((row) => ({
    name: `W${row.epi_week}`,
    date: row.week_start_date,
    cases: row.confirmed_cases,
    predicted: null,
    lower: null,
    upper: null,
    isForecast: false,
  }));
  let trend = base.length > 2 ? (base.at(-1).confirmed_cases - base.at(-3).confirmed_cases) / 2 : 0;
  let estimate = last.confirmed_cases;
  for (let index = 1; index <= horizon; index += 1) {
    const start = new Date(lastDate);
    start.setUTCDate(lastDate.getUTCDate() + (index - 1) * 7 + 1);
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 6);
    const week = Math.ceil((((start - Date.UTC(start.getUTCFullYear(), 0, 1)) / 86400000) + 1) / 7);
    trend *= 0.85;
    estimate = Math.max(0, estimate + trend + Math.sin((week / 52) * Math.PI * 2) * 10);
    projected.push({
      name: `${start.toISOString().slice(0, 10)} (Proj)`, week_start_date: start.toISOString().slice(0, 10), week_end_date: end.toISOString().slice(0, 10), cases: null, predicted: Math.round(estimate),
      lower: Math.max(0, Math.round(estimate * 0.7)), upper: Math.round(estimate * 1.4), isForecast: true,
    });
  }
  const lastObserved = projected[base.length - 1];
  lastObserved.predicted = lastObserved.cases;
  lastObserved.lower = lastObserved.cases;
  lastObserved.upper = lastObserved.cases;
  return projected;
}
