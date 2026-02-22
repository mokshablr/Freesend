"""
Custom exceptions for the Freesend Python SDK.
"""

from typing import Optional


class FreesendError(Exception):
    """Base exception for Freesend SDK errors."""

    def __init__(
        self,
        message: str,
        status_code: Optional[int] = None,
        code: Optional[str] = None,
    ):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.code = code


class FreesendAPIError(FreesendError):
    """Exception raised for API-related errors."""
    pass


class FreesendValidationError(FreesendError):
    """Exception raised for validation errors."""
    pass


class FreesendNetworkError(FreesendError):
    """Exception raised for network-related errors."""
    pass 