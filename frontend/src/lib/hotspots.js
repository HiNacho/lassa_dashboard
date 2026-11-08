export function classifyHistoricalBurden(record) {
  if (!Number.isFinite(record.confirmed) || record.confirmed <= 0) return 'unavailable';
  if (record.confirmed > 150 || (Number.isFinite(Number(record.cfr)) && Number(record.cfr) > 20)) return 'high';
  if (record.confirmed > 50 || (Number.isFinite(Number(record.cfr)) && Number(record.cfr) > 10)) return 'moderate';
  return 'low';
}
