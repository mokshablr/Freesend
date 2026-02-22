"""
Main client for the Freesend Python SDK.
"""

import json
import re
from typing import Dict, Any, Optional

import requests

from .exceptions import FreesendError, FreesendAPIError, FreesendValidationError, FreesendNetworkError
from .types import SendEmailRequest, SendEmailResponse, Attachment, FreesendConfig


class Freesend:
    """Main client for interacting with the Freesend API."""
    
    def __init__(self, config: FreesendConfig):
        """
        Initialize the Freesend client.
        
        Args:
            config: Configuration object containing API key and optional base URL
        """
        self.api_key = config.api_key
        self.base_url = config.base_url or "https://freesend.metafog.io"
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        })
    
    def send_email(self, data: SendEmailRequest) -> SendEmailResponse:
        """
        Send an email using the Freesend API.
        
        Args:
            data: Email request data
            
        Returns:
            SendEmailResponse object containing the API response
            
        Raises:
            FreesendValidationError: If the request data is invalid
            FreesendAPIError: If the API returns an error
            FreesendNetworkError: If there's a network error
        """
        # Validate the request data
        self._validate_email_data(data)
        
        # Convert to dictionary for JSON serialization
        payload = self._prepare_payload(data)
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/send-email",
                json=payload,
                timeout=30
            )
            
            # Parse the response
            try:
                result = response.json()
            except json.JSONDecodeError:
                raise FreesendAPIError("Invalid JSON response from server")
            
            # Check for errors
            if not response.ok:
                error_message = result.get("error", "Unknown error occurred")
                raise FreesendAPIError(error_message, response.status_code)
            
            return SendEmailResponse(message=result.get("message", ""))
            
        except requests.exceptions.RequestException as e:
            raise FreesendNetworkError(f"Network error: {str(e)}")
        except FreesendError:
            raise
        except Exception as e:
            raise FreesendError(f"Unexpected error: {str(e)}")
    
    def _validate_email_data(self, data: SendEmailRequest) -> None:
        """
        Validate the email request data.
        
        Args:
            data: Email request data to validate
            
        Raises:
            FreesendValidationError: If validation fails
        """
        if not data.fromEmail:
            raise FreesendValidationError("Missing required field: fromEmail")
        
        if not data.to:
            raise FreesendValidationError("Missing required field: to")
        
        if not data.subject:
            raise FreesendValidationError("Missing required field: subject")
        
        if not data.text and not data.html:
            raise FreesendValidationError("Missing required field: text or html")
        
        # Validate email format
        email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_regex, data.fromEmail):
            raise FreesendValidationError("Invalid fromEmail format")
        
        if not re.match(email_regex, data.to):
            raise FreesendValidationError("Invalid to email format")
        
        # Validate attachments if present
        if data.attachments:
            for attachment in data.attachments:
                if not attachment.filename:
                    raise FreesendValidationError("Attachment filename is required")
                if not attachment.content and not attachment.url:
                    raise FreesendValidationError("Attachment must have either content or url")
                if attachment.content and attachment.url:
                    raise FreesendValidationError("Attachment cannot have both content and url")
    
    def _prepare_payload(self, data: SendEmailRequest) -> Dict[str, Any]:
        """
        Prepare the payload for the API request.
        
        Args:
            data: Email request data
            
        Returns:
            Dictionary ready for JSON serialization
        """
        payload = {
            "fromEmail": data.fromEmail,
            "to": data.to,
            "subject": data.subject,
        }
        
        if data.fromName:
            payload["fromName"] = data.fromName
        
        if data.text:
            payload["text"] = data.text
        
        if data.html:
            payload["html"] = data.html
        
        if data.attachments:
            payload["attachments"] = []
            for att in data.attachments:
                attachment = {"filename": att.filename}
                if att.content is not None:
                    attachment["content"] = att.content
                if att.url is not None:
                    attachment["url"] = att.url
                if att.contentType is not None:
                    attachment["contentType"] = att.contentType
                payload["attachments"].append(attachment)
        
        return payload 