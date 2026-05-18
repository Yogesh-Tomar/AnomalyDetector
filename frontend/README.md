# AnomalyDetector UI

A React + TypeScript UI built with Vite for the Anomaly Detector project.

## Scripts (PowerShell)

- Install deps

```powershell
npm install
```

- Start dev server

```powershell
npm run dev
```

- Run tests

```powershell
npm test
```

- Lint and format

```powershell
npm run lint
npm run format
```

- Build and preview

```powershell
npm run build
npm run preview
```

## Environment

Copy `.env.example` to `.env` and set:

```
VITE_API_BASE_URL=http://localhost:5000
```

## Structure

- `src/pages`: Dashboard, Upload, Anomalies, Settings
- `src/shared`: Layout
- `src/services/api.ts`: Axios instance and endpoints
- `src/routes/router.tsx`: Router configuration

## Notes

- React Router v6
- Vitest + Testing Library
- ESLint + Prettier