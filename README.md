# School Document Request and Status Tracking System

A complete FastAPI + React application for submitting, processing, tracking, and reporting school document requests. Local development uses SQLite; production can use PostgreSQL on Neon.

## Structure

See `backend/` and `frontend/` directories. The backend provides Google OAuth callback, JWT security, role authorization, Mailjet-primary/Brevo-fallback SMTP delivery, SQLite or PostgreSQL persistence, request workflows, and manual FIFO/search/bubble-sort demonstrations. The frontend provides all student, teacher, and administrator routes.

## Backend setup

```powershell
cd school-document-system/backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python seed.py
uvicorn app.main:app --reload
python -m uvicorn app.main:app --reload
```

Configure `.env` with Google OAuth, Mailjet, and Brevo credentials. Mailjet is tried first and Brevo is used if Mailjet is unavailable or fails. Google OAuth requires the redirect URI `http://localhost:8000/api/auth/google/callback`.

For production, configure `DATABASE_URL` with your Neon PostgreSQL connection string and set production secrets and frontend CORS origins in your backend host. See [backend production setup](backend/README.md#production-database-neon).

## Frontend setup

```powershell
cd school-document-system/frontend
npm install
copy .env.example .env
npm run dev
```

Open `http://localhost:5173`. API documentation is available at `http://localhost:8000/docs` and `http://localhost:8000/redoc`.

## Google OAuth

Create a Google OAuth web credential, enable the Google OAuth/OpenID scopes, and add `http://localhost:8000/api/auth/google/callback` as an authorized redirect URI.

## User roles

The system has three roles: **Administrator** (full access, including account role management), **Registrar** (request workflow only), and **User** (submits and tracks personal document requests). User affiliation is separate from system role and may be **Student**, **Faculty**, or **Graduated**. New accounts are regular users by default.

## Email delivery

Configure both providers in `.env` for failover. Mailjet uses `in-v3.mailjet.com:587`, your Mailjet API key as `MAILJET_SMTP_USERNAME`, and its secret key as `MAILJET_SMTP_PASSWORD`. Set `MAILJET_FROM_EMAIL` to a sender verified in Mailjet. Brevo uses `smtp-relay.brevo.com:587`, its SMTP login and SMTP key, and `BREVO_FROM_EMAIL` as a sender verified in Brevo. Gmail SMTP is not used.

## Testing

Run ``python -m pytes`t` in the backend after adding project tests. Run `npm run build` in the frontend.
