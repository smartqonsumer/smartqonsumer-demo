"""Transactional emails behind a provider-agnostic EmailService.

Providers: "smtp" (Mailpit locally, any SMTP relay in production), "console" (logs a
notice, dev only) and an in-memory outbox used by the tests. Business code only calls
`verify_email`, `reset_password`, `reward_confirmation`.
"""

import logging
import smtplib
from dataclasses import dataclass
from email.message import EmailMessage
from html import escape
from typing import Protocol

from app.core.config import Settings, get_settings

logger = logging.getLogger("smartqonsumer.email")


@dataclass
class OutgoingEmail:
    to: str
    subject: str
    text: str
    html: str
    kind: str


class EmailProvider(Protocol):
    def send(self, email: OutgoingEmail) -> None: ...


class ConsoleProvider:
    def send(self, email: OutgoingEmail) -> None:
        # The body holds a one-time link: printed only outside production, for local testing.
        logger.info("[email:%s] subject=%r\n%s", email.kind, email.subject, email.text)


class MemoryProvider:
    def __init__(self) -> None:
        self.outbox: list[OutgoingEmail] = []

    def send(self, email: OutgoingEmail) -> None:
        self.outbox.append(email)


class SmtpProvider:
    def __init__(self, settings: Settings):
        self.settings = settings

    def send(self, email: OutgoingEmail) -> None:
        msg = EmailMessage()
        msg["From"] = self.settings.email_from
        msg["To"] = email.to
        msg["Subject"] = email.subject
        msg.set_content(email.text)
        msg.add_alternative(email.html, subtype="html")
        with smtplib.SMTP(self.settings.smtp_host, self.settings.smtp_port, timeout=10) as smtp:
            if self.settings.smtp_starttls:
                smtp.starttls()
            if self.settings.smtp_username and self.settings.smtp_password:
                smtp.login(self.settings.smtp_username, self.settings.smtp_password)
            smtp.send_message(msg)


memory_provider = MemoryProvider()


def _provider(settings: Settings) -> EmailProvider:
    if settings.app_env == "test":
        return memory_provider
    if settings.email_provider == "smtp":
        return SmtpProvider(settings)
    if settings.is_production:
        raise RuntimeError("EMAIL_PROVIDER=console is not allowed in production")
    return ConsoleProvider()


def _layout(brand_name: str, title: str, paragraphs: list[str], cta_label: str, cta_url: str) -> str:
    body = "".join(f"<p style='margin:0 0 16px;line-height:1.5'>{escape(p)}</p>" for p in paragraphs)
    return (
        "<div style='font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#141414'>"
        f"<p style='font-weight:700;letter-spacing:.08em;text-transform:uppercase'>{escape(brand_name)}</p>"
        f"<h1 style='font-size:22px'>{escape(title)}</h1>{body}"
        f"<p><a href='{escape(cta_url, quote=True)}' style='display:inline-block;background:#B0002F;"
        "color:#fff;padding:14px 22px;border-radius:999px;text-decoration:none;font-weight:700'>"
        f"{escape(cta_label)}</a></p>"
        "<p style='font-size:12px;color:#6E6B6B'>Si vous n'êtes pas à l'origine de cette demande, "
        "ignorez simplement cet email.</p></div>"
    )


class EmailService:
    def __init__(self, brand_name: str = "SmartQonsumer", settings: Settings | None = None):
        self.settings = settings or get_settings()
        self.provider = _provider(self.settings)
        self._brand = brand_name

    def _send(
        self, kind: str, to: str, subject: str, title: str, lines: list[str], cta: str, url: str
    ) -> None:
        text = "\n\n".join([title, *lines, f"{cta} : {url}"])
        html = _layout(self._brand, title, lines, cta, url)
        try:
            self.provider.send(OutgoingEmail(to=to, subject=subject, text=text, html=html, kind=kind))
        except (OSError, smtplib.SMTPException):
            # Never log the recipient or the link; the user can ask for a new email.
            logger.exception("Email delivery failed (kind=%s)", kind)

    def verify_email(self, to: str, first_name: str | None, token: str, campaign_slug: str | None) -> None:
        # Token in the URL fragment: never sent to the web server (no access-log or
        # Referer leak); the static page reads it client-side.
        url = f"{self.settings.frontend_url}/verify-email/#token={token}"
        hours = self.settings.email_verification_ttl_hours
        self._send(
            "verify_email",
            to,
            f"{self._brand} — confirmez votre adresse email",
            f"Bonjour {first_name or ''}".strip() + ",",
            [
                "Merci pour votre inscription ! Confirmez votre adresse email pour activer votre compte.",
                f"Ce lien est valable {hours} heures et ne peut être utilisé qu'une seule fois.",
            ],
            "Confirmer mon adresse email",
            url,
        )

    def reset_password(self, to: str, token: str) -> None:
        minutes = self.settings.password_reset_ttl_minutes
        self._send(
            "reset_password",
            to,
            f"{self._brand} — réinitialisation de votre mot de passe",
            "Réinitialisation du mot de passe",
            [
                "Vous avez demandé à réinitialiser votre mot de passe.",
                f"Ce lien est valable {minutes} minutes et ne peut être utilisé qu'une seule fois.",
            ],
            "Choisir un nouveau mot de passe",
            f"{self.settings.frontend_url}/auth/reinitialiser/#token={token}",
        )

    def reward_confirmation(self, to: str, reward_title: str) -> None:
        self._send(
            "reward_confirmation",
            to,
            f"{self._brand} — votre récompense vous attend",
            f"🎁 {reward_title}",
            ["Votre récompense est disponible dans votre espace, rubrique « Mes récompenses »."],
            "Voir mes récompenses",
            f"{self.settings.frontend_url}/club/recompenses/",
        )
