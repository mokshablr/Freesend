"""
Tests for the Freesend Python SDK client.
"""

import unittest
from unittest.mock import patch, Mock
import json

import requests

from freesend import Freesend, SendEmailRequest, FreesendConfig, Attachment
from freesend.exceptions import (
    FreesendError,
    FreesendAPIError,
    FreesendValidationError,
    FreesendNetworkError,
)


class TestFreesendClient(unittest.TestCase):
    """Test cases for the Freesend client."""

    def setUp(self):
        """Set up test fixtures."""
        self.config = FreesendConfig(api_key="test-api-key")
        self.client = Freesend(self.config)

    def test_client_initialization(self):
        """Test client initialization with default base URL."""
        client = Freesend(FreesendConfig(api_key="test-key"))
        self.assertEqual(client.base_url, "https://freesend.metafog.io")

    def test_client_initialization_custom_url(self):
        """Test client initialization with custom base URL."""
        config = FreesendConfig(
            api_key="test-key",
            base_url="https://custom-freesend.com"
        )
        client = Freesend(config)
        self.assertEqual(client.base_url, "https://custom-freesend.com")

    @patch('freesend.client.requests.Session.post')
    def test_send_email_success(self, mock_post):
        """Test successful email sending."""
        # Mock successful response
        mock_response = Mock()
        mock_response.ok = True
        mock_response.json.return_value = {"message": "Email sent successfully"}
        mock_post.return_value = mock_response

        # Test data
        email_data = SendEmailRequest(
            fromEmail="test@example.com",
            to="recipient@example.com",
            subject="Test Email",
            text="This is a test email"
        )

        # Send email
        response = self.client.send_email(email_data)

        # Assertions
        self.assertEqual(response.message, "Email sent successfully")
        mock_post.assert_called_once()

    @patch('freesend.client.requests.Session.post')
    def test_send_email_api_error(self, mock_post):
        """Test API error handling."""
        # Mock error response
        mock_response = Mock()
        mock_response.ok = False
        mock_response.status_code = 401
        mock_response.json.return_value = {"error": "Invalid API key"}
        mock_post.return_value = mock_response

        # Test data
        email_data = SendEmailRequest(
            fromEmail="test@example.com",
            to="recipient@example.com",
            subject="Test Email",
            text="This is a test email"
        )

        # Assert error is raised
        with self.assertRaises(FreesendAPIError) as context:
            self.client.send_email(email_data)

        self.assertEqual(str(context.exception), "Invalid API key")
        self.assertEqual(context.exception.status_code, 401)

    def test_validation_missing_from_email(self):
        """Test validation for missing fromEmail."""
        email_data = SendEmailRequest(
            fromEmail="",
            to="recipient@example.com",
            subject="Test Email",
            text="This is a test email"
        )

        with self.assertRaises(FreesendValidationError) as context:
            self.client.send_email(email_data)

        self.assertIn("fromEmail", str(context.exception))

    def test_validation_missing_to(self):
        """Test validation for missing to."""
        email_data = SendEmailRequest(
            fromEmail="test@example.com",
            to="",
            subject="Test Email",
            text="This is a test email"
        )

        with self.assertRaises(FreesendValidationError) as context:
            self.client.send_email(email_data)

        self.assertIn("to", str(context.exception))

    def test_validation_missing_subject(self):
        """Test validation for missing subject."""
        email_data = SendEmailRequest(
            fromEmail="test@example.com",
            to="recipient@example.com",
            subject="",
            text="This is a test email"
        )

        with self.assertRaises(FreesendValidationError) as context:
            self.client.send_email(email_data)

        self.assertIn("subject", str(context.exception))

    def test_validation_missing_content(self):
        """Test validation for missing text/html content."""
        email_data = SendEmailRequest(
            fromEmail="test@example.com",
            to="recipient@example.com",
            subject="Test Email"
        )

        with self.assertRaises(FreesendValidationError) as context:
            self.client.send_email(email_data)

        self.assertIn("text or html", str(context.exception))

    def test_validation_invalid_email_format(self):
        """Test validation for invalid email format."""
        email_data = SendEmailRequest(
            fromEmail="invalid-email",
            to="recipient@example.com",
            subject="Test Email",
            text="This is a test email"
        )

        with self.assertRaises(FreesendValidationError) as context:
            self.client.send_email(email_data)

        self.assertIn("fromEmail", str(context.exception))

    def test_attachment_validation(self):
        """Test attachment validation."""
        email_data = SendEmailRequest(
            fromEmail="test@example.com",
            to="recipient@example.com",
            subject="Test Email",
            text="This is a test email",
            attachments=[
                Attachment(filename="")  # Missing filename
            ]
        )

        with self.assertRaises(FreesendValidationError) as context:
            self.client.send_email(email_data)

        self.assertIn("filename", str(context.exception))

    def test_attachment_must_have_content_or_url(self):
        """Test attachment must have either content or url."""
        email_data = SendEmailRequest(
            fromEmail="test@example.com",
            to="recipient@example.com",
            subject="Test Email",
            text="This is a test email",
            attachments=[Attachment(filename="file.pdf")]
        )
        with self.assertRaises(FreesendValidationError) as context:
            self.client.send_email(email_data)
        self.assertIn("content or url", str(context.exception))

    def test_attachment_cannot_have_both_content_and_url(self):
        """Test attachment cannot have both content and url."""
        email_data = SendEmailRequest(
            fromEmail="test@example.com",
            to="recipient@example.com",
            subject="Test Email",
            text="This is a test email",
            attachments=[
                Attachment(filename="file.pdf", content="base64", url="https://example.com/f.pdf")
            ]
        )
        with self.assertRaises(FreesendValidationError) as context:
            self.client.send_email(email_data)
        self.assertIn("cannot have both", str(context.exception))

    @patch('freesend.client.requests.Session.post')
    def test_send_email_network_error(self, mock_post):
        """Test network error handling."""
        mock_post.side_effect = requests.exceptions.RequestException("Connection refused")
        email_data = SendEmailRequest(
            fromEmail="test@example.com",
            to="recipient@example.com",
            subject="Test",
            text="Test"
        )
        with self.assertRaises(FreesendNetworkError) as context:
            self.client.send_email(email_data)
        self.assertIn("Connection refused", str(context.exception))

    def test_prepare_payload_attachments_no_path_key(self):
        """Test attachment payload uses content/url only (no path for security)."""
        email_data = SendEmailRequest(
            fromEmail="test@example.com",
            to="recipient@example.com",
            subject="Test",
            text="Test",
            attachments=[
                Attachment(filename="f.pdf", content="base64data", contentType="application/pdf"),
                Attachment(filename="g.pdf", url="https://example.com/g.pdf"),
            ],
        )
        payload = self.client._prepare_payload(email_data)
        for att in payload["attachments"]:
            self.assertNotIn("path", att, "Payload must not include path (API uses content/url only)")
        self.assertEqual(payload["attachments"][0]["content"], "base64data")
        self.assertNotIn("url", payload["attachments"][0])
        self.assertEqual(payload["attachments"][1]["url"], "https://example.com/g.pdf")
        self.assertNotIn("content", payload["attachments"][1])

    @patch('freesend.client.requests.Session.post')
    def test_send_email_invalid_json_response(self, mock_post):
        """Test invalid JSON response from server."""
        mock_response = Mock()
        mock_response.ok = True
        mock_response.json.side_effect = json.JSONDecodeError("Expecting value", "", 0)
        mock_post.return_value = mock_response
        email_data = SendEmailRequest(
            fromEmail="test@example.com",
            to="recipient@example.com",
            subject="Test",
            text="Test"
        )
        with self.assertRaises(FreesendAPIError) as context:
            self.client.send_email(email_data)
        self.assertIn("Invalid JSON", str(context.exception))


if __name__ == '__main__':
    unittest.main() 