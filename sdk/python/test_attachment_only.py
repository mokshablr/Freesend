import base64
import os
from freesend import Freesend, SendEmailRequest, FreesendConfig, Attachment

def test_attachment_only():
    # Set FREESEND_API_KEY and optionally FREESEND_BASE_URL (e.g. http://localhost:3000)
    config = FreesendConfig(
        api_key=os.getenv('FREESEND_API_KEY', 'your-api-key-here'),
        base_url=os.getenv('FREESEND_BASE_URL', 'https://freesend.metafog.io')
    )
    freesend = Freesend(config)
    
    print("🧪 Testing Freesend Python SDK - Attachment Only...\n")
    
    # Create test file content
    test_content = "This is a test attachment file for the local API test. If you can see this decoded content, the base64 fix is working correctly!"
    base64_content = base64.b64encode(test_content.encode('utf-8')).decode('utf-8')
    
    print("📎 Sending email with attachment...")
    print("📄 Original content:", test_content)
    print("🔢 Base64 content length:", len(base64_content))
    
    email_data = SendEmailRequest(
        fromName="Your Company",
        fromEmail=os.getenv('FREESEND_FROM_EMAIL', 'hello@yourdomain.com'),
        to=os.getenv('FREESEND_TO_EMAIL', 'recipient@example.com'),
        subject="Test Attachment Fix - Local API (Python)",
        html="<h1>Attachment Test</h1><p>This email tests the base64 attachment fix using Python SDK.</p><p>The attached file should contain readable text, not base64 encoded content.</p>",
        text="Attachment Test - This email tests the base64 attachment fix using Python SDK. The attached file should contain readable text, not base64 encoded content.",
        attachments=[
            Attachment(
                filename="test_attachment_fix_python.txt",
                content=base64_content,
                contentType="text/plain"
            )
        ]
    )
    
    try:
        response = freesend.send_email(email_data)
        print(f"✅ Email with attachment sent successfully: {response.message}")
        print("\n📧 Check your email inbox!")
        print("📎 The attachment should contain: \"This is a test attachment file for the local API test. If you can see this decoded content, the base64 fix is working correctly!\"")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        if "fetch" in str(e).lower():
            print("\n💡 Make sure the local API is running on localhost:3000")

if __name__ == "__main__":
    test_attachment_only() 