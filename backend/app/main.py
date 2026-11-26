from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from sqlalchemy import inspect, text

from .database import Base, engine
from . import models
from .routers import auth, requests, notifications, admin

Base.metadata.create_all(bind=engine)
if "users" in inspect(engine).get_table_names() and "password_hash" not in {
    column["name"] for column in inspect(engine).get_columns("users")
}:
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR"))

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
