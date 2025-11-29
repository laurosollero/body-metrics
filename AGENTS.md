# Repository Guidelines

## Project Structure & Module Organization
- `index.html` is the single-page shell; no build step or bundler. Serve via local HTTP (not `file://`) to let the service worker run.
- Core logic lives in `js/app.js` (controller), `js/data.js` (localStorage models, migrations), `js/charts.js` (Chart.js setup), and `js/utils.js` (helpers). Keep new behavior inside these modules instead of adding new globals.
- Styles are in `styles/main.css` (base) and `styles/mobile.css` (mobile tweaks). Icons and PWA assets sit in `icons/`, `manifest.json`, and `sw.js`. Data migration scripts belong in `scripts/`.

## Build, Test, and Development Commands
- Local server for development: `python3 -m http.server 4173` (run from repo root, then open `http://localhost:4173`). Any simple static server is fine; service worker caching requires HTTP.
- Clear cached assets after changing JS/CSS: click **Refresh Cached Files** in-app or update the cache version strings in `sw.js`.
- Quick data import: place export JSONs beside `bodymetrics-import.json` or run custom scripts in `scripts/` as needed.

## Coding Style & Naming Conventions
- JavaScript uses ES6+, 4-space indentation, semicolons present in existing code; prefer classes and small functions. Use `Utils.handleError` for error reporting and reuse the existing event-handling patterns.
- CSS uses 2-space indentation and CSS custom properties defined in `styles/main.css`; follow existing color tokens and spacing scales.
- Naming: keep IDs/classes descriptive and aligned with current patterns (`dashboardView`, `measurementForm`, etc.). Favor lowerCamelCase for variables/functions and kebab-case for CSS class names.

## Testing Guidelines
- No automated test suite is configured. Perform manual checks after changes: add/edit/delete measurements, toggle medication tracking, verify charts render with sample data, export/import JSON, and confirm offline behavior via the service worker.
- For service worker or cache changes, reload with cache cleared and verify fresh assets load plus offline navigation still works.

## Commit & Pull Request Guidelines
- Recent history uses short, imperative, lowercase subjects (e.g., `fix bugs on goals and adding force refresh assets`). Follow that style; keep subjects under ~70 chars.
- PRs should explain the user impact, list manual test notes, and attach screenshots for UI updates. Link issues or TODOs if applicable and call out any data migrations or cache version bumps.
