"""
Freesend Python SDK

Official Python SDK for the Freesend email API.
"""

from .client import Freesend
from .exceptions import FreesendError
from .types import Attachment, SendEmailRequest, SendEmailResponse, FreesendConfig

__version__ = "1.0.0"
__all__ = ["Freesend", "FreesendError", "Attachment", "SendEmailRequest", "SendEmailResponse", "FreesendConfig"] 