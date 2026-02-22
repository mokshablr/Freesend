#!/usr/bin/env python3
"""
Test script for the Freesend Python SDK with real API key.
"""

import os
from freesend import Freesend, SendEmailRequest, FreesendConfig

def test_real_email():
    """Test the Freesend Python SDK with real API key."""
    
    # Initialize the client (set FREESEND_API_KEY env var for real sends)
    config = FreesendConfig(api_key=os.getenv('FREESEND_API_KEY', 'your-api-key-here'))
    freesend = Freesend(config)
    
    print("🧪 Testing Freesend Python SDK with real API key...\n")
    
    # Create email request (set FREESEND_TO_EMAIL env var for recipient)
    email_data = SendEmailRequest(
        fromName="Your Company",
        fromEmail=os.getenv('FREESEND_FROM_EMAIL', 'hello@yourdomain.com'),
        to=os.getenv('FREESEND_TO_EMAIL', 'recipient@example.com'),
        subject="Test from Freesend Python SDK",
        html="<h1>Hello from Freesend!</h1><p>This is a test email sent using the Python SDK.</p><p>If you receive this, the SDK is working correctly!</p>",
        text="Hello from Freesend! This is a test email sent using the Python SDK. If you receive this, the SDK is working correctly!"
    )
    
    try:
        # Send the email
        response = freesend.send_email(email_data)
        print(f"✅ Email sent successfully: {response.message}")
        print("📧 Check your email inbox for the test message!")
    except Exception as e:
        print(f"❌ Error sending email: {e}")

if __name__ == "__main__":
    test_real_email() 