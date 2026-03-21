
# Barbershop Backend (Azure App Service)

Node/Express API with Google Calendar integration.

## Endpoints
- `GET /api/health` → health probe
- `POST /api/bookings` → create a calendar event

### Request body
```json
{
  "name": "Alex Client",
  "phone": "661-555-0123",
  "email": "alex@example.com",
  "service": "Haircut + Beard",
  "barber": "Jordan",
  "start": "2026-03-15T15:00:00-07:00",
  "end":   "2026-03-15T15:45:00-07:00",
  "notes": "Low fade"
}
```

## Environment variables
- `ALLOWED_ORIGINS` → comma-separated list (e.g., `https://user.github.io,https://user.github.io/repo`)
- `GOOGLE_CALENDAR_ID` → target calendar ID
- `GOOGLE_CLIENT_EMAIL` → service account email
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` → private key (keep newlines or use `\n`)
- `TIMEZONE` → e.g., `America/Los_Angeles`

## Local run
```bash
npm install
npm start
# http://localhost:8080/api/health
```

## Azure deploy via GitHub Actions
1. Create Azure Web App (Linux, Node 20). Get **Publish Profile**.
2. Add repo secrets: `AZURE_WEBAPP_NAME`, `AZURE_WEBAPP_PUBLISH_PROFILE`.
3. Push to `main`. Workflow deploys `dist/` to App Service.

