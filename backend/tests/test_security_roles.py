from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app.models.user import User
from app.utils.security import require_admin, require_request_staff


@pytest.mark.parametrize("role", ["Administrator", "Registrar"])
def test_request_staff_allows_administrators_and_registrars(role):
    user = SimpleNamespace(role=role)

    assert require_request_staff(user=user) is user


def test_request_staff_rejects_regular_users():
    with pytest.raises(HTTPException) as exc_info:
        require_request_staff(user=SimpleNamespace(role="User"))

    assert exc_info.value.status_code == 403


def test_registrar_cannot_use_administrator_only_permissions():
    with pytest.raises(HTTPException) as exc_info:
        require_admin(user=SimpleNamespace(role="Registrar"))

    assert exc_info.value.status_code == 403


def test_staff_roles_do_not_require_student_profile_fields():
    registrar = User(role="Registrar", email="registrar@gmail.com")

    assert registrar.profile_complete is True
