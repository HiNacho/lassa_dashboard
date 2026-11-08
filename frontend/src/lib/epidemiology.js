/** Epidemiological calculations with explicit missing-value semantics. */
export function sumObserved(rows, field) {
  const values = rows.map((row) => row[field]).filter(Number.isFinite);
  return values.length ? values.reduce((total, value) => total + value, 0) : null;
}

export function caseFatalityRate(deaths, confirmedCases) {
  if (!Number.isFinite(deaths) || !Number.isFinite(confirmedCases) || confirmedCases <= 0) {
    return null;
  }
  return (deaths / confirmedCases) * 100;
}

export function periodGrowthRate(current, previous) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}

export function movingAverage(values, windowSize = 3) {
  return values.map((value, index) => {
    const window = values.slice(Math.max(0, index - windowSize + 1), index + 1);
    if (window.length < windowSize || window.some((item) => !Number.isFinite(item))) return null;
    return window.reduce((total, item) => total + item, 0) / windowSize;
  });
}
