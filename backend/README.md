# Backend

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python seed.py
uvicorn app.main:app --reload
```

API documentation is available at `http://localhost:8000/docs` and `/redoc`.

## Production database (Neon)

Local development defaults to `sqlite:///./school_documents.db`. For production,
create a PostgreSQL database in Neon and set the backend's `DATABASE_URL` to its
pooled connection string. Neon `postgres://` and `postgresql://` URLs are supported;
the app uses psycopg. Keep the SSL option supplied by Neon (usually
`sslmode=require`) and store the URL as a secret in your hosting platform. Do not
commit production credentials to the repository.

Set a unique `JWT_SECRET_KEY` in production. Set `CORS_ORIGINS` to your deployed
frontend origin(s), comma-separated, and update Google OAuth's redirect URI to the
deployed backend's `/api/auth/google/callback` address. Install dependencies from
`requirements.txt` and start with `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
(or your host's equivalent). Tables are created on application startup. Creating
the Neon project and deploying the API require access to your hosting accounts.
