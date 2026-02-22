#!/usr/bin/env python3
"""
Email with attachment example using the Freesend Python SDK.
"""

import os
import base64
from freesend import Freesend, SendEmailRequest, FreesendConfig, Attachment


def send_email_with_attachment():
    """Send an email with attachment using the Freesend SDK."""
    
    # Initialize the client
    config = FreesendConfig(api_key=os.getenv('FREESEND_API_KEY', 'your-api-key-here'))
    freesend = Freesend(config)
    
    # Read and encode file
    try:
        with open('example.txt', 'rb') as file:
            file_content = base64.b64encode(file.read()).decode('utf-8')
    except FileNotFoundError:
        # Create a sample file content if example.txt doesn't exist
        file_content = base64.b64encode(b"This is a sample file content.").decode('utf-8')
    
    # Create attachment
    attachment = Attachment(
        filename="invoice.pdf",
        content=file_content,
        contentType="application/pdf"
    )
    
    # Create email request
    email_data = SendEmailRequest(
        fromName="Your Company",
        fromEmail="billing@yourdomain.com",
        to="customer@example.com",
        subject="Your invoice is ready",
        html="<h1>Invoice Attached</h1><p>Please find your invoice attached to this email.</p>",
        text="Invoice attached. Please find your invoice attached to this email.",
        attachments=[attachment]
    )
    
    try:
        # Send the email
        response = freesend.send_email(email_data)
        print(f"Email sent successfully: {response.message}")
    except Exception as e:
        print(f"Failed to send email: {e}")


if __name__ == "__main__":
    send_email_with_attachment() 