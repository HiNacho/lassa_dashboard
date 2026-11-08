import { describe, expect, it } from 'vitest';
import { filterByEpiYear, groupByCalendarMonth, summarizeNational } from './aggregation';
import { caseFatalityRate, movingAverage, periodGrowthRate } from './epidemiology';
import { matchStates, normalizeStateName, observationStatus } from './geography';
import { validateNationalRows } from './dataValidation';
import { classifyHistoricalBurden } from './hotspots';
import { buildIndicativeProjection } from './projection';

const weeklyRows = [
  { week_start_date: '2024-01-01', week_end_date: '2024-01-07', epi_year: 2024, epi_week: 1, suspected_cases: 10, confirmed_cases: 2, probable_cases: 1, deaths: 1 },
  { week_start_date: '2024-01-08', week_end_date: '2024-01-14', epi_year: 2024, epi_week: 2, suspected_cases: 20, confirmed_cases: 4, probable_cases: 0, deaths: 1 },
  { week_start_date: '2025-01-06', week_end_date: '2025-01-12', epi_year: 2025, epi_week: 1, suspected_cases: 5, confirmed_cases: 0, probable_cases: 0, deaths: 0 },
];

describe('national incident aggregation', () => {
  it('sums weekly incident observations for a selected epidemiological year', () => {
    expect(summarizeNational(filterByEpiYear(weeklyRows, 2024))).toMatchObject({ suspected_cases: 30, confirmed_cases: 6, probable_cases: 1, deaths: 2 });
  });

  it('uses observed suspected cases and calculates a compatible CFR', () => {
    expect(summarizeNational(filterByEpiYear(weeklyRows, 2024)).cfr).toBeCloseTo(33.333, 2);
  });

  it('returns null rather than fabricating values for missing or zero denominators', () => {
    expect(caseFatalityRate(1, 0)).toBeNull();
    expect(caseFatalityRate(null, 4)).toBeNull();
    expect(periodGrowthRate(4, 0)).toBeNull();
  });
});

describe('temporal calculations', () => {
  it('groups using reporting dates rather than approximate epi-week months', () => {
    expect(groupByCalendarMonth(weeklyRows)).toEqual([
      { name: '2024-01', cases: 6, deaths: 2, recordCount: 2 },
      { name: '2025-01', cases: 0, deaths: 0, recordCount: 1 },
    ]);
  });

  it('uses a trailing moving average and preserves insufficient windows as missing', () => {
    expect(movingAverage([2, 4, 6, 8], 3)).toEqual([null, null, 4, 6]);
    expect(movingAverage([2, null, 6], 3)).toEqual([null, null, null]);
  });
});

describe('validation and geographic matching', () => {
  it('rejects duplicate reporting periods and malformed count values', () => {
    const invalid = [...weeklyRows, { ...weeklyRows[0] }, { ...weeklyRows[1], epi_week: 3, confirmed_cases: -1 }];
    const result = validateNationalRows(invalid);
    expect(result.valid).toHaveLength(3);
    expect(result.errors).toHaveLength(2);
  });

  it('rejects missing required values without converting them to zero', () => {
    const result = validateNationalRows([{ ...weeklyRows[0], suspected_cases: null }]);
    expect(result.valid).toHaveLength(0);
    expect(result.errors[0]).toContain('missing suspected_cases');
  });

  it('rejects malformed, impossible, reversed, and non-weekly dates', () => {
    for (const patch of [
      { week_start_date: 'invalid-date' }, { week_start_date: '2024-02-30' },
      { week_start_date: '2024-01-08', week_end_date: '2024-01-01' }, { week_end_date: '2024-01-08' },
    ]) expect(validateNationalRows([{ ...weeklyRows[0], ...patch }]).valid).toHaveLength(0);
  });

  it('normalizes approved aliases and reports unmatched geography', () => {
    expect(normalizeStateName(' Federal Capital Territory ')).toBe('FCT');
    const result = matchStates([{ state_clean: 'Abuja' }, { state_clean: 'Unknown State' }], ['FCT']);
    expect(result.matched).toHaveLength(1);
    expect(result.unmatched).toHaveLength(1);
  });

  it('keeps observed zero distinct from missing and invalid observations', () => {
    expect(observationStatus({ confirmed: 0, deaths: 0 })).toBe('observed');
    expect(observationStatus(null)).toBe('missing');
    expect(observationStatus({ confirmed: null, deaths: 0 })).toBe('invalid');
  });
});

describe('screening and indicative projection', () => {
  it('applies documented historical screening thresholds', () => {
    expect(classifyHistoricalBurden({ confirmed: 151, cfr: 1 })).toBe('high');
    expect(classifyHistoricalBurden({ confirmed: 51, cfr: 1 })).toBe('moderate');
    expect(classifyHistoricalBurden({ confirmed: 1, cfr: 1 })).toBe('low');
    expect(classifyHistoricalBurden({ confirmed: 0, cfr: 0 })).toBe('unavailable');
  });

  it('keeps observations separate from a fixed-horizon projection', () => {
    const result = buildIndicativeProjection(weeklyRows.slice(0, 2), 2);
    expect(result).toHaveLength(4);
    expect(result[0].isForecast).toBe(false);
    expect(result[2]).toMatchObject({ isForecast: true, cases: null });
    expect(result[2].lower).toBeLessThanOrEqual(result[2].predicted);
    expect(result[2].upper).toBeGreaterThanOrEqual(result[2].predicted);
  });

  it('creates twelve consecutive seven-day periods across calendar rollover', () => {
    const rows = [{ ...weeklyRows[0], epi_week: 52, week_start_date: '2024-12-23', week_end_date: '2024-12-29' }];
    const projections = buildIndicativeProjection(rows).filter((row) => row.isForecast);
    expect(projections).toHaveLength(12);
    expect(projections[0].week_start_date).toBe('2024-12-30');
    expect(projections[1].week_start_date).toBe('2025-01-06');
    expect(projections[0].week_end_date).toBe('2025-01-05');
  });
});
