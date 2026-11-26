import smtplib
from email.message import EmailMessage
from datetime import date

from sqlalchemy.orm import Session
from ..config import settings
from ..models.email_log import EmailLog


def _send(db: Session, recipient: str, subject: str, html: str, email_type: str, request=None, user=None):
    subject = subject
    log = EmailLog(
        request_id=request.id if request else None,
        user_id=user.id if user else None,
        recipient_email=recipient,
        email_type=email_type,
        subject=subject,
        status="Pending",
    )
    db.add(log)
    db.flush()
    if not settings.brevo_smtp_username or not settings.brevo_smtp_password or not settings.brevo_from_email:
        log.status = "Failed"
        log.error_message = "Brevo SMTP is not configured"
        db.commit()
        return False
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = f"{settings.brevo_from_name} <{settings.brevo_from_email}>"
    message["To"] = recipient
    message.set_content("Please view this email in an HTML-capable email client.")
    message.add_alternative(html, subtype="html")
    try:
        with smtplib.SMTP(settings.brevo_smtp_host, settings.brevo_smtp_port, timeout=20) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.login(settings.brevo_smtp_username, settings.brevo_smtp_password)
            smtp.send_message(message)
        log.status = "Sent"
        db.commit()
        return True
    except Exception as exc:
        log.status = "Failed"
        log.error_message = str(exc)
        db.commit()
        return False


def _html(title: str, request, status: str, explanation: str, next_step: str):
    release = request.release_date.strftime("%B %d, %Y") if getattr(request, "release_date", None) else "Not set"
    return f"""
    <html><body style="font-family:Arial,sans-serif;color:#1f2937">
      <div style="max-width:600px;margin:auto;border:1px solid #e5e7eb;padding:24px;border-radius:12px">
        <h2 style="color:#12372A">{settings.brevo_from_name}</h2>
        <h3>{title}</h3>
        <p><strong>Request ID:</strong> {request.request_id}</p>
        <p><strong>Document:</strong> {request.document_type}</p>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Document Release Date:</strong> {release}</p>
        <p>{explanation}</p>
        <p><strong>Next step:</strong> {next_step}</p>
      </div>
    </body></html>
    """


def send_request_submitted_email(db, request):
    html = _html("Request Submitted", request, "Pending", "Your document request was submitted successfully.", "Wait for an administrator to process the request.")
    _send(db, request.user.email, f"Request Submitted - {request.request_id}", html, "Request Submitted", request, request.user)


def send_processing_email(db, request):
    html = _html("Request Processing", request, "Processing", "Your request is now being processed.", "Please wait for the registrar to complete processing.")
    _send(db, request.user.email, f"Request Processing - {request.request_id}", html, "Processing", request, request.user)


def send_hold_email(db, request):
    html = _html("Request On Hold", request, "On Hold", "Your request has been placed on hold.", "An administrator will review or resume the request.")
    _send(db, request.user.email, f"Request On Hold - {request.request_id}", html, "On Hold", request, request.user)


def send_rejection_email(db, request):
    html = _html("Request Rejected", request, "Rejected", f"Reason: {request.rejection_reason}", "Review the rejection reason and submit a new request if needed.")
    _send(db, request.user.email, f"Request Rejected - {request.request_id}", html, "Rejected", request, request.user)


def send_ready_for_claim_email(db, request):
    html = _html("Document Ready for Claim", request, "Ready for Claim", "Your document is ready for claim.", "Visit the registrar office on or after the document release date.")
    _send(db, request.user.email, f"Ready for Claim - {request.request_id}", html, "Ready for Claim", request, request.user)


def send_release_email(db, request):
    html = _html("Document Released", request, "Released", "Your document has been released.", "Keep this notice and the released document for your records.")
    _send(db, request.user.email, f"Document Released - {request.request_id}", html, "Released", request, request.user)


def send_cancelled_email(db, request):
    html = _html("Request Cancelled", request, "Cancelled", f"Cancellation reason: {request.cancellation_reason}", "No further action is required.")
    _send(db, request.user.email, f"Request Cancelled - {request.request_id}", html, "Cancelled", request, request.user)


def send_release_date_changed_email(db, request):
    html = _html("Release Date Updated", request, request.status, "The document release date has been updated.", "Check the new date before visiting the registrar.")
    _send(db, request.user.email, f"Release Date Updated - {request.request_id}", html, "Release Date Changed", request, request.user)


def send_test_email(db, recipient: str):
    class TestRequest:
        request_id = "TEST-EMAIL"
        document_type = "System Test"
        release_date = None
    html = _html("Brevo SMTP Test", TestRequest(), "Test", "This is a test email sent by the School Document Request System.", "No further action is required.")
    return _send(db, recipient, "School System - Brevo SMTP Test", html, "Test")
