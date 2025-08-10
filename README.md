<img src="./public/freesend-icon.png" width="100" alt="Freesend logo" />

# Freesend - Your Email API Using Your Infrastructure!

## Overview

**Freesend** is a lightweight email API built for developers who want full control over email delivery without the complexity or cost of third-party platforms.

Hosted at **[freesend.metafog.io](https://freesend.metafog.io)**, it lets you send emails through a simple HTTP API using **your own SMTP provider** (like Gmail, Zoho, Mailgun, etc.).

Designed with **serverless apps, indie hackers, and backend engineers** in mind, Freesend lets you send emails through a simple HTTP API — powered entirely by **your own SMTP server** (like Gmail, Zoho, Mailgun, etc.).

No vendor lock-in. No usage caps. No surprise pricing.

> _"I needed to send 1-2k emails/day from my serverless app. Freesend just worked — and saved me time and money."_  
> ~ A real user

---

## Why Freesend?

Most email platforms either:

- Limit you to **a few hundred free emails per month**
- Charge a premium for usage-based pricing
- Lock you into **their** infrastructure

Freesend flips that model:

✅ **Use Your Own SMTP**  
✅ **Simple HTTP API**  
✅ **Free & Open Source (and you don't need to self-host!)**  

Ideal for:

- Serverless apps that need reliable transactional emails
- Startups who want full transparency & control
- Developers who value simplicity and clean open-source code

---

## ✨ Key Features

- ⚡ **Easy HTTP API** - Send email with just one `POST` request
- 📬 **Full SMTP Control** - Bring your own Gmail, Zoho, Outlook, or custom SMTP
- 📀 **Attachments Support** - Send PDFs, images, etc. via base64
- 🧠 **Intuitive Schema** - Clean field names (`fromName`, `fromEmail`, etc.)
- 🧑‍💻 **Minimal & Hackable** - Fully open source and easy to extend
- 💬 **Plain Text + HTML** - Support for both formats out of the box

---

## 👨‍💻 Try It Instantly (Hosted API)

Use our hosted Freesend instance right now:

### API URL
```
https://freesend.metafog.io/api/send-email
```

### Example Usage (Node.js)
```js
const sendEmail = async () => {
  const url = "https://freesend.metafog.io/api/send-email";
  const apiKey = "YOUR_API_KEY"; // Get one at https://freesend.metafog.io

  const emailData = {
    fromName: "Your Company",
    fromEmail: "hello@yourdomain.com",
    to: "user@example.com",
    subject: "Hello from Freesend!",
    html: "<h1>Welcome!</h1>",
    text: "Welcome!",
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(emailData),
  });

  const result = await res.json();
  console.log(result);
};

sendEmail();
```

---

## 🚀 JavaScript/TypeScript SDK

For a better developer experience, use our official **JavaScript/TypeScript SDK**:

### Installation

```bash
npm install @freesend/sdk
```

### Quick Start

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

### Email with Attachment

```typescript
import { Freesend } from '@freesend/sdk';
import { readFileSync } from 'fs';

const freesend = new Freesend({
  apiKey: 'your-api-key-here'
});

// Read and encode file
const fileContent = readFileSync('./invoice.pdf', { encoding: 'base64' });

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
```

### Features

- ✨ **TypeScript Support** - Full type definitions included
- 🔧 **Simple API** - Clean, intuitive methods
- 📎 **Attachment Support** - Send files via base64 encoding
- 🌐 **Cross-Platform** - Works in Node.js and browsers
- 🛡️ **Error Handling** - Comprehensive error types and messages
- ⚙️ **Customizable** - Support for custom base URLs

### SDK Documentation

For complete SDK documentation, examples, and API reference, visit:
- [JavaScript/TypeScript SDK README](https://freesend.metafog.io/docs/sdk/javascript)
- [NPM Package](https://www.npmjs.com/package/@freesend/sdk)

---

## 💡 Real Use Cases

- Seamlessly send **transactional emails** from your JAMstack or serverless app — signups, OTPs, receipts & more
- Use Gmail SMTP to avoid setting up Postfix or Mailgun
- Replace expensive email APIs with your own hosted function
- Maintain **full data ownership** of your outbound emails

---

## ❤️ Community & Contributions

Freesend is growing because of awesome developers like [you](https://github.com/mokshablr/Freesend/pulls)! If you're interested in:

- Improving the UI / UX
- Implementing new features
- Adding templating support

...open a PR or drop a discussion! 💬

---

## 📚 Resources
- [Documentation](https://freesend.metafog.io/docs)
- [API Reference](https://freesend.metafog.io/docs/api/send-email)
- [SMTP Setup Guide](https://freesend.metafog.io/docs/configuration/mail-server)
- [JavaScript/TypeScript SDK](https://www.npmjs.com/package/@freesend/sdk) - Official SDK with examples

---

## 🔗 Projects Using Freesend

- [grovv.app](https://grovv.app) – A spreadsheet‑powered **sales CRM for SMBs** that uses Freesend to send transactional emails.
- [mar.toolhub.live](https://mar.toolhub.live) – A certificate generation platform for MAR point submissions, using Freesend to deliver 1,000–2,000 official, QR-verified emails daily via Gmail SMTP.


Want to be listed? [Open a PR](https://github.com/mokshablr/Freesend/pulls)!

---

## License

This project is licensed under the [MIT License](LICENSE).