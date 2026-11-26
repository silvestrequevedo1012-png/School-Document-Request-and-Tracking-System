from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from sqlalchemy import inspect, text

from .database import Base, engine
from . import models
from .routers import auth, requests, notifications, admin

Base.metadata.create_all(bind=engine)
if "users" in inspect(engine).get_table_names():
    existing_user_columns = {column["name"] for column in inspect(engine).get_columns("users")}
    missing_user_columns = {
        "password_hash": "VARCHAR",
        "address": "TEXT",
        "age": "INTEGER",
        "contact_number": "VARCHAR(30)",
        "department": "VARCHAR(120)",
        "course": "VARCHAR(120)",
        "member_type": "VARCHAR(20)",
        "graduation_year": "INTEGER",
    }
    with engine.begin() as connection:
        for column, sql_type in missing_user_columns.items():
            if column not in existing_user_columns:
                connection.execute(text(f"ALTER TABLE users ADD COLUMN {column} {sql_type}"))

app = FastAPI(
    title="School Document Request and Status Tracking System",
    version="1.0.0",
    description="A FIFO-based document request and tracking system.",
)

origins = [item.strip() for item in settings.cors_origins.split(",") if item.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(requests.router)
app.include_router(notifications.router)
app.include_router(admin.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
