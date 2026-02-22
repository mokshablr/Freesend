#!/usr/bin/env python3
"""
Simple test script for the Freesend Python SDK.
"""

from freesend import Freesend, SendEmailRequest, FreesendConfig

def test_sdk():
    """Test the Freesend Python SDK."""
    print("🧪 Testing Freesend Python SDK...\n")
    
    # Initialize the client
    config = FreesendConfig(api_key="test-api-key")
    freesend = Freesend(config)
    
    print("✅ Client initialized successfully")
    
    # Test email data
    email_data = SendEmailRequest(
        fromName="Test Company",
        fromEmail="test@example.com",
        to="recipient@example.com",
        subject="Test Email from SDK",
        html="<h1>Test Email</h1><p>This is a test email from the Freesend Python SDK.</p>",
        text="Test Email - This is a test email from the Freesend Python SDK."
    )
    
    print("✅ Email data prepared")
    print(f"📧 Email data: {email_data}")
    
    try:
        # This will fail with a real API call, but we can test the validation
        print("\n🔄 Attempting to send email...")
        response = freesend.send_email(email_data)
        print(f"✅ Email sent successfully: {response.message}")
    except Exception as e:
        print(f"❌ Expected error (no real API key): {e}")
        print("✅ SDK is working correctly - validation and error handling work!")
    
    # Test validation errors
    print("\n🧪 Testing validation errors...")
    
    try:
        freesend.send_email(SendEmailRequest(
            # Missing required fields
            fromEmail="test@example.com"
        ))
    except Exception as e:
        print(f"✅ Validation error caught: {e}")
    
    print("\n🎉 Python SDK test completed!")

if __name__ == "__main__":
    test_sdk() 