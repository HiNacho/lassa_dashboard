# Data dictionary

## National weekly CSV

| Field | Meaning | Use |
|---|---|---|
| `week_start_date`, `week_end_date` | Inclusive seven-day reporting period | Temporal grouping and coverage |
| `epi_year`, `epi_week` | NCDC epidemiological period | Year/week filtering |
| `suspected_cases`, `confirmed_cases`, `probable_cases`, `deaths` | Weekly incident counts | National summaries; CFR uses deaths / confirmed cases from the same selection |
| `extraction_method`, `extraction_timestamp` | Dataset extraction provenance | Audit metadata only |
| `report_pdf_url` | NCDC source report | Source traceability |

## State annual JSON

| Field | Meaning | Use |
|---|---|---|
| `state_clean`, `state_pcode` | Administrative unit | Geographic matching |
| `year` | Reporting year | Annual map/ranking filter |
| `suspected`, `confirmed`, `probable`, `deaths` | Annual state observations | State-only map and ranking calculations |
| `center_lat`, `center_lon`, `area_sqkm` | Geographic metadata | Reference only |

Missing values are invalid during loading; zero is retained only when explicitly observed as zero. National and state fields are not interchangeable.
