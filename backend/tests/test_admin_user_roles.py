import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.database import Base
from app.models import AuditLog, User
from app.routers.admin import update_user_role
from app.schemas.admin import UserRoleUpdate


@pytest.fixture
def db():
    engine = create_engine("sqlite://")
    Base.metadata.create_all(bind=engine)
    with Session(engine) as session:
        yield session
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


def create_user(db, name, email, role):
    user = User(full_name=name, email=email, role=role, is_active=True)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_administrator_can_assign_registrar_role_and_audit_change(db):
    admin = create_user(db, "Administrator", "admin@example.com", "Administrator")
    user = create_user(db, "Staff Member", "staff@example.com", "User")

    updated = update_user_role(user.id, UserRoleUpdate(role="Registrar"), db, admin)

    assert updated.role == "Registrar"
    audit = db.query(AuditLog).one()
    assert audit.admin_id == admin.id
    assert audit.action == "UPDATE_USER_ROLE"


def test_administrator_cannot_change_own_role(db):
    admin = create_user(db, "Administrator", "admin@example.com", "Administrator")

    with pytest.raises(HTTPException) as exc_info:
        update_user_role(admin.id, UserRoleUpdate(role="User"), db, admin)

    assert exc_info.value.status_code == 400
    assert db.query(AuditLog).count() == 0
