import smtplib

from app.services import email_service


class FakeDatabase:
    def add(self, item):
        self.item = item

    def flush(self):
        pass

    def commit(self):
        pass


class FakeSMTP:
    attempts = []
    sent_from = []
    fail_username = None

    def __init__(self, host, port, timeout):
        self.host = host
        self.port = port

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        return False

    def ehlo(self):
        pass

    def starttls(self):
        pass

    def login(self, username, password):
        self.attempts.append(username)
        if username == self.fail_username:
            raise smtplib.SMTPAuthenticationError(535, b"authentication failed")

    def send_message(self, message):
        self.sent_from.append(message["From"])


def configure_providers(monkeypatch, *, mailjet=True, brevo=True):
    settings = email_service.settings
    values = {
        "mailjet_smtp_host": "in-v3.mailjet.com",
        "mailjet_smtp_port": 587,
        "mailjet_smtp_username": "mailjet-user" if mailjet else "",
        "mailjet_smtp_password": "mailjet-password" if mailjet else "",
        "mailjet_from_email": "mailjet@example.com" if mailjet else "",
        "brevo_smtp_host": "smtp-relay.brevo.com",
        "brevo_smtp_port": 587,
        "brevo_smtp_username": "brevo-user" if brevo else "",
        "brevo_smtp_password": "brevo-password" if brevo else "",
        "brevo_from_email": "brevo@example.com" if brevo else "",
    }
    for name, value in values.items():
        monkeypatch.setattr(settings, name, value)
    monkeypatch.setattr(settings, "brevo_from_name", "School Document Request System")
    FakeSMTP.attempts = []
    FakeSMTP.sent_from = []
    FakeSMTP.fail_username = None
    monkeypatch.setattr(email_service.smtplib, "SMTP", FakeSMTP)


def test_mailjet_is_tried_before_brevo(monkeypatch):
    configure_providers(monkeypatch)
    db = FakeDatabase()

    sent = email_service._send(db, "student@example.com", "Subject", "<p>Body</p>", "Test")

    assert sent is True
    assert FakeSMTP.attempts == ["mailjet-user"]
    assert FakeSMTP.sent_from == ["School Document Request System <mailjet@example.com>"]
    assert db.item.status == "Sent"


def test_brevo_is_used_when_mailjet_fails(monkeypatch):
    configure_providers(monkeypatch)
    FakeSMTP.fail_username = "mailjet-user"
    db = FakeDatabase()

    sent = email_service._send(db, "student@example.com", "Subject", "<p>Body</p>", "Test")

    assert sent is True
    assert FakeSMTP.attempts == ["mailjet-user", "brevo-user"]
    assert FakeSMTP.sent_from == ["School Document Request System <brevo@example.com>"]
    assert db.item.status == "Sent"
    assert "Mailjet SMTP failed" in db.item.error_message
    assert "Email sent via Brevo" in db.item.error_message


def test_send_fails_when_no_provider_is_configured(monkeypatch):
    configure_providers(monkeypatch, mailjet=False, brevo=False)
    db = FakeDatabase()

    sent = email_service._send(db, "student@example.com", "Subject", "<p>Body</p>", "Test")

    assert sent is False
    assert db.item.status == "Failed"
    assert db.item.error_message == "No SMTP providers are configured"
    assert FakeSMTP.attempts == []
