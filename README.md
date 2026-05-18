# Anomaly Detector

A full-stack network anomaly detection and investigation dashboard.

| Layer | Stack |
|-------|-------|
| Backend | ASP.NET Core 8 · SQL Server · Entity Framework Core |
| Auth | JWT (local) + Azure AD SSO (MSAL) |
| Frontend | React 18 · TypeScript · Vite · Vitest |

## Project Structure

```
anomaly-detector/
├── backend/    # ASP.NET Core Web API
└── frontend/   # React + TypeScript UI
```

## Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [SQL Server](https://www.microsoft.com/en-us/sql-server) (Express or Developer edition)
- [Node.js 18+](https://nodejs.org/)

### Backend Setup

```bash
cd backend/AnomalyDetectionDashboard

# Copy the config template and fill in your values
cp appsettings.example.json appsettings.json
```

Edit `appsettings.json` and set:
- `ConnectionStrings.DefaultConnection` — your SQL Server connection string
- `Jwt.Secret` — a random 256-bit string
- `AzureAd.TenantId` / `ClientId` / `ClientSecret` — your Azure AD app registration

```bash
dotnet restore
dotnet run
# API runs at https://localhost:7xxx / http://localhost:5192
```

### Frontend Setup

```bash
cd frontend

# Copy the env template and fill in your values
cp .env.example .env
```

Edit `.env` and set:
- `VITE_API_BASE_URL` — backend URL (e.g. `http://localhost:5192`)
- `VITE_MSAL_CLIENT_ID` / `VITE_MSAL_AUTHORITY` — Azure AD app registration

```bash
npm install
npm run dev
# UI runs at http://localhost:5173
```

## Configuration Reference

| File | Purpose |
|------|---------|
| `backend/.../appsettings.example.json` | Template — copy to `appsettings.json` |
| `frontend/.env.example` | Template — copy to `.env` |

Neither `appsettings.json` nor `.env` are tracked by git.

## Scripts

```bash
# Backend
dotnet test          # run tests

# Frontend
npm test             # run Vitest
npm run lint         # ESLint
npm run build        # production build
```
