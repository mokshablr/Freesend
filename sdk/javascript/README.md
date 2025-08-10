# Freesend JavaScript/TypeScript SDK

Official JavaScript and TypeScript SDK for the Freesend email API.

## Installation

```bash
npm install @freesend/sdk
```

## Quick Start

```typescript
import { Freesend } from '@freesend/sdk';

const freesend = new Freesend({
  apiKey: 'your-api-key-here'
});

// Send a simple email
const { message } = await freesend.sendEmail({
  fromName: 'Your Company',
  fromEmail: 'hello@yourdomain.com',
  to: 'recipient@example.com',
  subject: 'Hello from Freesend!',
  html: '<h1>Welcome!</h1><p>This email was sent using Freesend.</p>',
  text: 'Welcome! This email was sent using Freesend.'
});

console.log(message); // "Email sent successfully"
```

## API Reference

### Constructor

```typescript
new Freesend(config: FreesendConfig)
```

#### Config Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `apiKey` | string | Yes | Your Freesend API key |
| `baseUrl` | string | No | Custom base URL (defaults to `https://freesend.metafog.io`) |

### sendEmail

```typescript
sendEmail(data: SendEmailRequest): Promise<SendEmailResponse>
```

Sends an email using the Freesend API.

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fromName` | string | No | Display name for the sender |
| `fromEmail` | string | Yes | Sender email address |
| `to` | string | Yes | Recipient email address |
| `subject` | string | Yes | Email subject line |
| `html` | string | No* | HTML content of the email |
| `text` | string | No* | Plain text content of the email |
| `attachments` | Attachment[] | No | Array of attachment objects |

*At least one of `html` or `text` is required.

#### Attachment Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `filename` | string | Yes | Name of the attachment file |
| `content` | string | Yes** | Base64 encoded file content |
| `path` | string | Yes** | File path (for server-side files only) |
| `contentType` | string | No | MIME type of the file |

**Either `content` or `path` is required, but not both.

## Examples

### Basic Email

```typescript
import { Freesend } from '@freesend/sdk';

const freesend = new Freesend({
  apiKey: 'your-api-key-here'
});

try {
  const result = await freesend.sendEmail({
    fromName: 'Your Company',
    fromEmail: 'hello@yourdomain.com',
    to: 'user@example.com',
    subject: 'Welcome to our platform!',
    html: '<h1>Welcome!</h1><p>Thank you for joining us.</p>',
    text: 'Welcome! Thank you for joining us.'
  });
  
  console.log('Email sent:', result.message);
} catch (error) {
  console.error('Failed to send email:', error.message);
}
```

### Email with Attachment

```typescript
import { Freesend } from '@freesend/sdk';
import { readFileSync } from 'fs';

const freesend = new Freesend({
  apiKey: 'your-api-key-here'
});

// Read and encode file
const fileContent = readFileSync('./invoice.pdf', { encoding: 'base64' });

try {
  const result = await freesend.sendEmail({
    fromName: 'Your Company',
    fromEmail: 'billing@yourdomain.com',
    to: 'customer@example.com',
    subject: 'Your invoice is ready',
    html: '<h1>Invoice Attached</h1><p>Please find your invoice attached.</p>',
    text: 'Invoice attached. Please find your invoice attached.',
    attachments: [
      {
        filename: 'invoice.pdf',
        content: fileContent,
        contentType: 'application/pdf'
      }
    ]
  });
  
  console.log('Email sent:', result.message);
} catch (error) {
  console.error('Failed to send email:', error.message);
}
```

### Using Custom Base URL

```typescript
import { Freesend } from '@freesend/sdk';

const freesend = new Freesend({
  apiKey: 'your-api-key-here',
  baseUrl: 'https://your-custom-freesend-instance.com'
});

// Use as normal...
```

## Error Handling

The SDK throws `FreesendError` instances for API errors:

```typescript
import { Freesend, FreesendError } from '@freesend/sdk';

const freesend = new Freesend({
  apiKey: 'your-api-key-here'
});

try {
  await freesend.sendEmail({
    fromEmail: 'hello@yourdomain.com',
    to: 'user@example.com',
    subject: 'Test email'
    // Missing html/text content
  });
} catch (error) {
  if (error instanceof FreesendError) {
    console.error('Freesend error:', error.message);
    console.error('Status code:', error.statusCode);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Common Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Missing required fields or invalid data |
| 401 | Unauthorized - Invalid or missing API key |
| 403 | Forbidden - API key is inactive or invalid |
| 500 | Internal Server Error - Email sending failed |

## Browser Usage

The SDK works in both Node.js and browser environments:

```html
<script type="module">
  import { Freesend } from 'https://unpkg.com/@freesend/sdk@latest/dist/index.js';
  
  const freesend = new Freesend({
    apiKey: 'your-api-key-here'
  });
  
  // Use as normal...
</script>
```

## Development

```bash
# Install dependencies
npm install

# Build the SDK
npm run build

# Run tests
npm test

# Watch mode for development
npm run dev
```

## License

MIT License - see [LICENSE](../../LICENSE) for details. 