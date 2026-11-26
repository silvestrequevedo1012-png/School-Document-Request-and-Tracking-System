from datetime import date
import re

from pydantic import BaseModel, Field, field_validator, model_validator
from .user import UserResponse


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: str = Field(max_length=254)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise ValueError("Enter your full name")
        return value

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        value = value.strip().lower()
        if "@" not in value or "." not in value.rsplit("@", 1)[-1] or any(c.isspace() for c in value):
            raise ValueError("Enter a valid email address")
        return value


class LoginRequest(BaseModel):
    email: str = Field(max_length=254)
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        value = value.strip().lower()
        if "@" not in value or "." not in value.rsplit("@", 1)[-1] or any(c.isspace() for c in value):
            raise ValueError("Enter a valid email address")
        return value


class ProfileCompletionRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    address: str = Field(min_length=5, max_length=500)
    age: int = Field(ge=5, le=120)
    contact_number: str = Field(min_length=7, max_length=30)
    school_id: str = Field(min_length=2, max_length=80)
    department: str = Field(min_length=2, max_length=120)
    course: str | None = Field(default=None, max_length=120)
    member_type: str = Field(pattern="^(Student|Faculty|Graduated)$")
    graduation_year: int | None = Field(default=None, ge=1900, le=date.today().year)

    @field_validator("full_name", "address", "contact_number", "school_id", "department", "course", mode="before")
    @classmethod
    def strip_text_fields(cls, value):
        return value.strip() if isinstance(value, str) else value

    @field_validator("contact_number")
    @classmethod
    def validate_contact_number(cls, value: str) -> str:
        digits = re.sub(r"\D", "", value)
        if len(digits) < 7 or re.fullmatch(r"[+0-9().\-\s]+", value) is None:
            raise ValueError("Enter a valid contact number")
        return value

    @model_validator(mode="after")
    def validate_member_fields(self):
        if self.member_type in {"Student", "Graduated"} and not self.course:
            raise ValueError("Course is required for students and graduates")
        if self.member_type == "Graduated":
            if self.graduation_year is None:
                raise ValueError("Graduation year is required for graduates")
        elif self.graduation_year is not None:
            raise ValueError("Graduation year only applies to graduates")
        return self
