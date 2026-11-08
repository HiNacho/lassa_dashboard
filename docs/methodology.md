# Methodology

National cards aggregate weekly incident observations by sum for the selected epidemiological year or all available years. CFR is `sum(deaths) / sum(confirmed_cases) × 100`; it is displayed as N/A when the confirmed denominator is zero or unavailable.

Temporal charts preserve epidemiological weeks for single-year views. The all-year view groups observations by the actual `week_start_date` calendar month, never by an approximate week-to-month conversion. Moving averages are trailing three-observation averages and are not shown until three complete observations exist. Growth is not calculated when the previous observation is zero or missing.

State maps use separately maintained annual state observations. They are not reconciled to national weekly data and state shares use only state totals. “Provisional historical screening” is descriptive: its fixed thresholds identify historical annual burden and are not active-outbreak, transmission-risk, or clinical-action determinations.

For maps, an observed zero is distinct from a missing, invalid, or geographically unavailable observation. Missing reports use a separate grey fill and accessible label; they are excluded from risk classifications and rankings.

The indicative trend projection extends the last eligible weekly national value for 12 epidemiological weeks with a damped recent trend plus a simple seasonal term. Its 70%–140% display range is illustrative, not a confidence or prediction interval. It is not a trained model and must not guide operations. A future model requires versioned input data, revision policy, held-out temporal evaluation, calibration, and reported accuracy.

Projection periods use consecutive seven-day calendar reporting dates after the final eligible observation. Calendar dates take precedence over epidemiological-week labels when conventions cannot be independently verified.

Malformed, empty, or invalid source datasets enter a shared loading, empty, or error state and are not passed into analytical views.
