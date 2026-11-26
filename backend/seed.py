from datetime import date, datetime, timedelta, timezone
from app.database import Base, engine, SessionLocal
from app.models import User, DocumentRequest, StatusHistory, Notification

Base.metadata.create_all(bind=engine)
db = SessionLocal()

users = [
    User(google_id="demo-student", full_name="Maria Santos", email="maria.student@example.com", role="Student", school_id="2026-0001", is_active=True),
    User(google_id="demo-teacher", full_name="Carlos Reyes", email="carlos.teacher@example.com", role="Teacher", school_id="T-1001", is_active=True),
    User(google_id="demo-admin", full_name="Registrar Administrator", email="registrar.admin@example.com", role="Administrator", school_id="A-1001", is_active=True),
]
for user in users:
    if not db.query(User).filter(User.email == user.email).first():
        db.add(user)
db.commit()

statuses = ["Pending", "Processing", "On Hold", "Ready for Claim", "Released", "Cancelled", "Rejected"]
document_types = ["Certificate of Enrollment", "Certificate of Grades", "Transcript of Records", "Good Moral Certificate", "Certificate of Graduation", "Diploma", "School Clearance", "Service Record", "Other"]
student = db.query(User).filter(User.email == "maria.student@example.com").first()
admin = db.query(User).filter(User.email == "registrar.admin@example.com").first()
if student:
    for index, status in enumerate(statuses, start=1):
        request_id = f"REQ-{index:06d}"
        if db.query(DocumentRequest).filter(DocumentRequest.request_id == request_id).first():
            continue
        request = DocumentRequest(
            request_id=request_id,
            user_id=student.id,
            document_type=document_types[(index - 1) % len(document_types)],
            purpose="Fictional academic requirement",
            number_of_copies=1,
            additional_notes="Seed demonstration request",
            status=status,
            release_date=date.today() + timedelta(days=7) if status in {"Ready for Claim", "Released"} else None,
            rejected_at=datetime.now(timezone.utc) if status == "Rejected" else None,
            rejected_by=admin.id if status == "Rejected" else None,
            rejection_reason="Incomplete information" if status == "Rejected" else None,
        )
        db.add(request)
        db.flush()
        db.add(StatusHistory(request_id=request.id, previous_status=None, new_status=status, reason="Demo seed data", changed_by=admin.id))
        db.add(Notification(user_id=student.id, request_id=request.id, title=f"Demo {status}", message=f"{request_id} status is {status}."))
db.commit()
db.close()
print("Seed data created.")
