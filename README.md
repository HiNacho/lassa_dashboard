# 🦟 Lassa Fever Dashboard

A comprehensive, interactive geospatial and temporal analysis dashboard for monitoring and visualizing Lassa fever outbreak data across Nigerian states.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-brightgreen.svg)

---

## 📋 Overview

The Lassa Fever Dashboard is a React-based exploratory visualization of archived Nigerian Lassa fever surveillance observations. It supports transparent national weekly summaries, temporal descriptions, annual state reporting burden maps, and an indicative 12-week trend projection. It is not a real-time surveillance system or validated operational forecasting tool.

### 🎯 Key Features

- **📍 Spatial Analysis**: Interactive geospatial visualization of Lassa fever cases across Nigerian states
- **📊 Temporal Trends**: Time-series analysis showing outbreak patterns and seasonal variations
- **🔮 Indicative Trend Projection**: A transparent, non-trained 12-week heuristic projection
- **📈 Overview Dashboard**: Summary statistics and key performance indicators
- **💾 Data Export**: Export processed data and visualizations
- **🎨 Responsive Design**: Works seamlessly across desktop and tablet devices

---

## 🛠️ Tech Stack

| Tool | Purpose | Badge |
|------|---------|-------|
| **React** | Frontend UI framework | ![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react&logoColor=white) |
| **Vite** | Lightning-fast build tool | ![Vite](https://img.shields.io/badge/Vite-8.0.4-646CFF?logo=vite&logoColor=white) |
| **Recharts** | Interactive charting library | ![Recharts](https://img.shields.io/badge/Recharts-3.8.1-8884D8?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCBmaWxsPSIjODg4NEQ4IiB3aWR0aD0iMjAiIGhlaWdodD0iMzAiIHk9IjQwIi8+PHJlY3QgZmlsbD0iIzg4ODREOCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjYwIiB4PSI0MCIgeT0iMjAiLz48cmVjdCBmaWxsPSIjODg4NEQ4IiB3aWR0aD0iMjAiIGhlaWdodD0iNDUiIHg9IjgwIiB5PSIzNSIvPjwvc3ZnPg==) |
| **D3** (D3-geo, D3-scale) | Geospatial and scale utilities | ![D3](https://img.shields.io/badge/D3-4.0.2+-F77800?logo=d3.js&logoColor=white) |
| **react-simple-maps** | Interactive mapping component | ![Maps](https://img.shields.io/badge/Maps-3.0.0-FF6B6B) |
| **Lucide React** | Beautiful icon library | ![Icons](https://img.shields.io/badge/Icons-1.8.0-FF0000) |
| **PapaParse** | CSV data parsing | ![CSV](https://img.shields.io/badge/CSV-5.5.3-228AE6) |
| **ESLint** | Code quality & linting | ![ESLint](https://img.shields.io/badge/ESLint-9.39.4-4B32C3?logo=eslint&logoColor=white) |

---

## 📁 Project Structure

```
lassa_dashboard/
├── main.ipynb                          # Jupyter notebook for data analysis
├── dataset/                            # Raw data files
│   ├── clean_lassa_fever_map_data.csv
│   └── lassa_fever_timeseries_full.csv
└── frontend/                           # React Vite application
    ├── package.json
    ├── vite.config.js
    ├── eslint.config.js
    ├── index.html
    ├── public/
    │   └── dataset/                   # Static geospatial data
    │       ├── lassa_fever_timeseries_full.csv
    │       ├── lassa_state_data.json
    │       └── nigeria_states.geojson
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── App.css
        ├── index.css
        ├── components/
        │   ├── Header.jsx
        │   ├── Sidebar.jsx
        │   ├── Footer.jsx
        │   ├── charts/                # Chart components
        │   └── tabs/                  # Tab components
        │       ├── OverviewTab.jsx
        │       ├── SpatialAnalysisTab.jsx
        │       ├── TemporalTrendsTab.jsx
        │       └── ForecastInsightsTab.jsx
        └── context/
            └── DataContext.jsx        # Global state management
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   cd lassa_dashboard/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5174` (or the next available port)

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Linting

Check code quality:
```bash
npm run lint
```

### Tests and data audit

```bash
npm run test
npm run audit:data
```

## Methodological notes

- National CSV values are treated as weekly incident observations and are summed for annual totals.
- CFR uses deaths and confirmed cases from the same selected national reporting period; a zero or unavailable denominator is shown as N/A.
- State annual data is maintained separately and does not reconcile with national weekly totals. It is not used to calculate national state shares.
- The projection is illustrative and not a calibrated forecast or confidence interval.
- See [data-quality audit](docs/data-quality-audit.md), [data dictionary](docs/data-dictionary.md), and [methodology](docs/methodology.md) for limitations and definitions.

---

## 📊 Data

### Data Files

- **`lassa_fever_timeseries_full.csv`**: Time-series data with daily case counts and trends
- **`lassa_state_data.json`**: Aggregated statistics by Nigerian state
- **`nigeria_states.geojson`**: GeoJSON file with state boundaries for mapping

### Data Format

Time-series data includes:
- Date
- State
- Confirmed cases
- Deaths
- Recovery information (where available)

---

## 🎨 Features in Detail

### 📍 Spatial Analysis Tab
Interactive choropleth map visualizing Lassa fever case distribution across Nigerian states. Hover over states to see detailed statistics.

### 📈 Temporal Trends Tab
Multi-line time-series chart tracking case progression over time with seasonal patterns and trend analysis.

### 🔮 Forecast Insights Tab
Predictive models and forecasting visualizations to help anticipate future outbreak trajectories.

### 📊 Overview Tab
Key metrics dashboard with:
- Total cases and deaths
- Case fatality rate
- Most affected regions
- Trend indicators

---

## 🔧 Development

### Component Structure

- **Header**: Navigation and title
- **Sidebar**: Tab navigation
- **DataContext**: Global state for managing and sharing data across components
- **Charts**: Reusable charting components using Recharts and D3
- **Footer**: Application footer with metadata

### Adding New Features

1. Create new components in `src/components/`
2. Use `DataContext` to access shared application state
3. Import and use chart libraries as needed
4. Test with `npm run lint` before committing

---

## 📦 Dependencies

### Core Dependencies
- `react` - UI framework
- `react-dom` - React DOM rendering
- `vite` - Build tool

### Data Visualization
- `recharts` - Interactive charts
- `d3-geo` - Geographic projections
- `d3-scale` - Scale utilities
- `react-simple-maps` - Map component

### Utilities
- `papaparse` - CSV parsing
- `lucide-react` - Icon library
- `prop-types` - Runtime type checking

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Support & Contact

For questions, issues, or suggestions, please open an issue on the repository or contact the development team.

---

## 🙏 Acknowledgments

- Data sources and epidemiological resources
- Open-source community and library maintainers
- Contributors and users

---

**Last Updated**: May 2026 | **Status**: Active Development
