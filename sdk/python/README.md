# Freesend Python SDK

Official Python SDK for the Freesend email API.

## Installation

```bash
pip install freesend
```

## Quick Start

```python
from freesend import Freesend, SendEmailRequest, FreesendConfig

# Initialize the client
config = FreesendConfig(api_key="your-api-key-here")
freesend = Freesend(config)

# Create email request
email_data = SendEmailRequest(
    fromName="Your Company",
    fromEmail="hello@yourdomain.com",
    to="recipient@example.com",
    subject="Hello from Freesend!",
    html="<h1>Welcome!</h1><p>This email was sent using Freesend.</p>",
    text="Welcome! This email was sent using Freesend."
)

# Send the email
try:
    response = freesend.send_email(email_data)
    print(response.message)  # "Email sent successfully"
except Exception as e:
    print(f"Failed to send email: {e}")
```

## API Reference

### FreesendConfig

Configuration object for the Freesend client.

```python
from freesend import FreesendConfig

config = FreesendConfig(
    api_key="your-api-key-here",
    base_url="https://freesend.metafog.io"  # Optional, defaults to this value
)
```

### SendEmailRequest

Request data for sending an email.

```python
from freesend import SendEmailRequest, Attachment

email_data = SendEmailRequest(
    fromEmail="hello@yourdomain.com",  # Required
    to="recipient@example.com",        # Required
    subject="Email Subject",           # Required
    fromName="Your Company",           # Optional
    text="Plain text content",         # Optional (either text or html required)
    html="<h1>HTML content</h1>",     # Optional (either text or html required)
    attachments=[                      # Optional
        Attachment(
            filename="document.pdf",
            content="base64_encoded_content",
            contentType="application/pdf"
        )
    ]
)
```

### Attachment

Represents an email attachment.

```python
from freesend import Attachment

attachment = Attachment(
    filename="document.pdf",            # Required
    content="base64_encoded_content",   # Required (either content or url)
    url="https://example.com/file.pdf", # Optional (either content or url, not both)
    contentType="application/pdf"       # Optional
)
```

## Examples

### Basic Email

```python
from freesend import Freesend, SendEmailRequest, FreesendConfig

# Initialize client
freesend = Freesend(FreesendConfig(api_key="your-api-key-here"))

# Send simple email
try:
    response = freesend.send_email(SendEmailRequest(
        fromName="Your Company",
        fromEmail="hello@yourdomain.com",
        to="user@example.com",
        subject="Welcome to our platform!",
        html="<h1>Welcome!</h1><p>Thank you for joining us.</p>",
        text="Welcome! Thank you for joining us."
    ))
    print("Email sent:", response.message)
except Exception as e:
    print("Failed to send email:", e)
```

### Email with Attachment

```python
import base64
from freesend import Freesend, SendEmailRequest, Attachment, FreesendConfig

# Initialize client
freesend = Freesend(FreesendConfig(api_key="your-api-key-here"))

# Read and encode file
with open("invoice.pdf", "rb") as file:
    file_content = base64.b64encode(file.read()).decode('utf-8')

# Create attachment
attachment = Attachment(
    filename="invoice.pdf",
    content=file_content,
    contentType="application/pdf"
)

# Send email with attachment
try:
    response = freesend.send_email(SendEmailRequest(
        fromName="Your Company",
        fromEmail="billing@yourdomain.com",
        to="customer@example.com",
        subject="Your invoice is ready",
        html="<h1>Invoice Attached</h1><p>Please find your invoice attached.</p>",
        text="Invoice attached. Please find your invoice attached.",
        attachments=[attachment]
    ))
    print("Email sent:", response.message)
except Exception as e:
    print("Failed to send email:", e)
```

### Using Custom Base URL

```python
from freesend import Freesend, FreesendConfig

# Initialize with custom base URL
config = FreesendConfig(
    api_key="your-api-key-here",
    base_url="https://your-custom-freesend-instance.com"
)
freesend = Freesend(config)

# Use as normal...
```

### Error Handling

```python
from freesend import Freesend, SendEmailRequest, FreesendConfig
from freesend.exceptions import FreesendError, FreesendAPIError, FreesendValidationError

freesend = Freesend(FreesendConfig(api_key="your-api-key-here"))

try:
    response = freesend.send_email(SendEmailRequest(
        fromEmail="hello@yourdomain.com",
        to="user@example.com",
        subject="Test email"
        # Missing html/text content
    ))
except FreesendValidationError as e:
    print("Validation error:", e.message)
except FreesendAPIError as e:
    print("API error:", e.message)
    print("Status code:", e.status_code)
except FreesendError as e:
    print("Freesend error:", e.message)
except Exception as e:
    print("Unexpected error:", e)
```

## Common Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Missing required fields or invalid data |
| 401 | Unauthorized - Invalid or missing API key |
| 403 | Forbidden - API key is inactive or invalid |
| 500 | Internal Server Error - Email sending failed |

## Development

```bash
# Clone the repository
git clone https://github.com/mokshablr/Freesend.git
cd Freesend/sdk/python

# Install in development mode
pip install -e .

# Install development dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Format code
black freesend/

# Lint code
flake8 freesend/

# Type checking
mypy freesend/
```

## License

MIT License - see [LICENSE](../../LICENSE) for details. 