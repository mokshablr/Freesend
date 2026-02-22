#!/usr/bin/env python3
"""
Basic email example using the Freesend Python SDK.
"""

import os
from freesend import Freesend, SendEmailRequest, FreesendConfig


def send_basic_email():
    """Send a basic email using the Freesend SDK."""
    
    # Initialize the client
    config = FreesendConfig(api_key=os.getenv('FREESEND_API_KEY', 'your-api-key-here'))
    freesend = Freesend(config)
    
    # Create email request
    email_data = SendEmailRequest(
        fromName="Your Company",
        fromEmail="hello@yourdomain.com",
        to="recipient@example.com",
        subject="Hello from Freesend!",
        html="<h1>Welcome!</h1><p>This email was sent using the Freesend Python SDK.</p>",
        text="Welcome! This email was sent using the Freesend Python SDK."
    )
    
    try:
        # Send the email
        response = freesend.send_email(email_data)
        print(f"Email sent successfully: {response.message}")
    except Exception as e:
        print(f"Failed to send email: {e}")


if __name__ == "__main__":
    send_basic_email() 