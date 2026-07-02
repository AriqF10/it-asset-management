# IT Asset Management System

A full-stack IT asset management app for tracking hardware/software inventory, assignments, and maintenance — built as a portfolio project. Every asset change is recorded in an audit log and pushed via a signed webhook to a SOC monitoring dashboard.

## Features

- JWT authentication with roles: Admin, IT Staff (no public self-registration — accounts are admin-provisioned only)
- Asset CRUD with category, status, location, and warranty tracking
- Assign/unassign assets to employees, with full assignment history
- Maintenance records (scheduled maintenance, repairs, calibration) with automatic asset status sync
- Dashboard with stats (by status, by category, warranty expiring soon / expired)
- Full audit trail of every asset event (created, updated, assigned, status changed, deleted, maintenance logged)
- Signed webhook (HMAC-SHA256) pushing audit events to an external SOC dashboard in real time
- Rate limiting, HSTS, JWT refresh token blacklisting, and other production hardening applied from day one

## Tech Stack

- **Frontend:** React (Vite), React Router, Axios, Recharts
- **Backend:** Django, Django REST Framework, Simple JWT
- **Database:** PostgreSQL (Supabase in production)

## Running Locally

### Backend

```bash
cd backend
python -m venv venv
./venv/Scripts/activate  # Windows
pip install -r requirements.txt
cp .env.example .env     # adjust as needed, or set USE_SQLITE=True for a quick start
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## SOC Dashboard Integration

Set `SOC_WEBHOOK_URL` and `SOC_WEBHOOK_SECRET` in the backend environment. Every asset event fires a signed POST request:

```json
{
  "source": "asset-management",
  "action": "assigned",
  "asset_tag": "LAP-0001",
  "asset_name": "Dell Latitude 5420",
  "actor": "admin",
  "details": { "employee": "Budi Santoso" },
  "timestamp": "2026-07-03T00:12:41+07:00"
}
```

The request includes an `X-Signature` header (HMAC-SHA256 hex digest of the raw body, signed with `SOC_WEBHOOK_SECRET`) so the receiving dashboard can verify authenticity.

## Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Supabase (PostgreSQL)
