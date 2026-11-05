# Data quality audit

Audit date: 2026-11-05. The reproducible check is `cd frontend && npm run audit:data`.

## National weekly series

- 313 rows; continuous Monday-start, seven-day reporting periods from 2019-12-30 through 2025-12-28.
- Epi years 2020–2025: 53 rows in 2020 and 52 in each later year.
- No duplicate `week_start_date` or `(epi_year, epi_week)` records; no missing weekly intervals.
- `suspected_cases`, `confirmed_cases`, `probable_cases`, and `deaths` are complete non-negative integers. No weekly death count exceeds confirmed cases.
- The fields are **weekly incident observations**, not cumulative counts. Values decrease within years and the 2025 week 51 CSV row exactly matches the “Current week” column in the linked NCDC situation report (105 suspected, 21 confirmed, 2 probable, 5 deaths).
- Every row has an NCDC situation-report URL. Extraction method metadata is mixed: 251 automated, 46 manual, 16 mixed. Historical revisions cannot be determined from the stored snapshot because it does not retain report versions.

## State annual series

- 222 state-year records, covering 37 boundaries (36 states plus FCT) for 2020–2025.
- All `state_clean` names match the supplied GeoJSON names exactly.
- Annual state totals do not reconcile with national weekly totals. State minus national death differences are +85 (2020), +25 (2021), +45 (2022), +17 (2023), +7 (2024), and +4 (2025). Confirmed and suspected differences also occur.

## Interpretation and unresolved issues

The datasets are independently maintained reporting products and must not be forced to agree. Likely causes—different publication cut-offs, revisions, geographic allocation, or case/death definitions—are not documented in the repository. Consequently, this application does not use national totals as denominators for state shares and labels the map as annual state reporting burden. Full row-by-row reconciliation against archived source reports remains a Phase 2 data-governance task.
