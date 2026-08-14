# Ledger — Investment Portfolio Tracker (Frontend)

A React frontend for the [Investment Portfolio Tracker API](https://github.com/harshitxaa/investment-portfolio-tracker)
(Spring Boot / JWT backend). Built with Vite, React Router, Tailwind CSS v4, Axios, and Recharts.

## Design

The visual direction is a "financial ledger" aesthetic rather than a generic dashboard template:
a graph-paper grid background, hairline-ruled tables instead of boxed cards, tabular monospace
numerals for every figure, and small rotated "stamp" badges for gain/loss instead of plain
colored text. Typefaces: Space Grotesk for headings/labels, Inter for body copy, IBM Plex Mono
for all numeric data.

## Pages

- **Login / Register** — JWT auth against `/api/auth/login` and `/api/auth/register`
- **Portfolios** — list, create, delete portfolios
- **Portfolio detail** — summary stats, computed holdings, a 90-day value chart, return/volatility/Sharpe
  ratio, and a filterable, paginated transaction history with add/delete
- **Watchlist** — track symbols with live prices without holding them

## Running locally

1. Start the backend (see the [API repo](https://github.com/harshitxaa/investment-portfolio-tracker)) — it should be listening on `http://localhost:8080`.
2. Copy `.env.example` to `.env` and adjust `VITE_API_BASE_URL` if the backend runs elsewhere.
3. Install and run:

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default.

## Build

```bash
npm run build
```

## Notes on the API contract

The backend README documents summary/analytics response shapes only loosely, so the UI reads
several plausible field name variants defensively (e.g. `totalPL` or `totalUnrealizedPL`,
`valueSeries` or `dailyValues`). If your actual DTOs differ, adjust the field lookups in
`src/pages/PortfolioDetail.jsx` and `src/components/AnalyticsPanel.jsx` — everything else
(auth, portfolios, transactions, watchlist) matches the endpoint list in the backend README
exactly.
