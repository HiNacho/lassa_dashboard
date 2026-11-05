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
    const week = ((last.epi_week + index - 1) % 52) + 1;
    trend *= 0.85;
    estimate = Math.max(0, estimate + trend + Math.sin((week / 52) * Math.PI * 2) * 10);
    projected.push({
      name: `W${week} (Proj)`, cases: null, predicted: Math.round(estimate),
      lower: Math.max(0, Math.round(estimate * 0.7)), upper: Math.round(estimate * 1.4), isForecast: true,
    });
  }
  const lastObserved = projected[base.length - 1];
  lastObserved.predicted = lastObserved.cases;
  lastObserved.lower = lastObserved.cases;
  lastObserved.upper = lastObserved.cases;
  return projected;
}
