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
