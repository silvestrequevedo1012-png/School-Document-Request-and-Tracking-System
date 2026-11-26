# School Document Request and Status Tracking System

A complete FastAPI + React + SQLite application for submitting, processing, tracking, and reporting school document requests.

## Structure

See `backend/` and `frontend/` directories. The backend provides Google OAuth callback, JWT security, role authorization, Brevo SMTP, SQLite persistence, request workflows, and manual FIFO/search/bubble-sort demonstrations. The frontend provides all student, teacher, and administrator routes.

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

Configure `.env` with Google OAuth and Brevo credentials. Google OAuth requires the redirect URI `http://localhost:8000/api/auth/google/callback`.

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

## Brevo SMTP

Create a Brevo SMTP account and use the SMTP relay, SMTP login, SMTP key, sender address, and `587` in `.env`. Gmail SMTP is not used.

## Testing

Run ``python -m pytes`t` in the backend after adding project tests. Run `npm run build` in the frontend.
