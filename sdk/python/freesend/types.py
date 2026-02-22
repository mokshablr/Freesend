"""
Type definitions for the Freesend Python SDK.
"""

from dataclasses import dataclass
from typing import List, Optional


@dataclass
class Attachment:
    """Represents an email attachment."""

    filename: str
    content: Optional[str] = None  # base64 encoded content (optional if url is provided)
    url: Optional[str] = None      # URL to external file (optional if content is provided)
    contentType: Optional[str] = None


@dataclass
class SendEmailRequest:
    """Request data for sending an email."""
    
    fromEmail: str
    to: str
    subject: str
    fromName: Optional[str] = None
    text: Optional[str] = None
    html: Optional[str] = None
    attachments: Optional[List[Attachment]] = None


@dataclass
class SendEmailResponse:
    """Response from the send email API."""
    
    message: str


@dataclass
class FreesendConfig:
    """Configuration for the Freesend client."""
    
    api_key: str
    base_url: Optional[str] = None 