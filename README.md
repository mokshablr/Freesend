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

## 🔄 Migrating from Resend?

Freesend is **Resend SDK-compatible**. If you're already using the `resend` npm package, switch to Freesend with one environment variable. Zero code changes.

```bash
# Just add this to your .env
RESEND_BASE_URL=https://freesend.metafog.io/api
```

Your existing code works as-is:

```js
import { Resend } from 'resend';

const resend = new Resend('YOUR_FREESEND_API_KEY');

await resend.emails.send({
  from: 'hello@yourdomain.com',
  to: 'user@example.com',
  subject: 'Sent via Freesend',
  text: 'Same Resend SDK. Your own SMTP. No vendor lock-in.',
});
```

> The Resend SDK reads `RESEND_BASE_URL` from your environment and routes all requests to your Freesend instance instead of Resend's servers.

---

## ✨ Key Features

- ⚡ **Easy HTTP API** - Send email with just one `POST` request
- 🔄 **Resend SDK Compatible** - Drop-in replacement, one env var to switch
- 📬 **Full SMTP Control** - Bring your own Gmail, Zoho, Outlook, or custom SMTP
- 📀 **Attachments Support** - Send PDFs, images, etc. via base64
- 📊 **Send History Dashboard** - Track every email with status (sent/failed/pending)
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

## 🚀 Official SDKs

Use an official SDK for a better developer experience. Full docs, examples, and API reference are on the [documentation site](https://freesend.metafog.io/docs).

| Language       | Install | Documentation |
|----------------|---------|----------------|
| **JavaScript/TypeScript** | `npm install @freesend/sdk` | [JS/TS SDK docs](https://freesend.metafog.io/docs/sdk/javascript) |
| **Python**     | `pip install freesend` | [Python SDK docs](https://freesend.metafog.io/docs/sdk/python) |

---

## 💡 Real Use Cases

- Seamlessly send **transactional emails** from your JAMstack or serverless app — signups, OTPs, receipts & more
- Use Gmail SMTP to avoid setting up Postfix or Mailgun
- Replace expensive email APIs with your own hosted function
- Maintain **full data ownership** of your outbound emails

---

## 🧪 Testing

Freesend uses [Vitest](https://vitest.dev/) for testing.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

Tests are located in the `tests/` directory. When contributing, please add tests for new endpoints and business logic.

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
- [API Reference](https://freesend.metafog.io/docs/api/send-email) · [Resend-Compatible API](https://freesend.metafog.io/docs/api/resend-compatible)
- [SMTP Setup Guide](https://freesend.metafog.io/docs/configuration/mail-server)
- [JavaScript/TypeScript SDK](https://freesend.metafog.io/docs/sdk/javascript) · [Python SDK](https://freesend.metafog.io/docs/sdk/python)

---

## 🔗 Projects Using Freesend

- [grovv.app](https://grovv.app) – A spreadsheet‑powered **sales CRM for SMBs** that uses Freesend to send transactional emails.
- [mar.toolhub.live](https://mar.toolhub.live) – A certificate generation platform for MAR point submissions, using Freesend to deliver 1,000–2,000 official, QR-verified emails daily via Gmail SMTP.


Want to be listed? [Open a PR](https://github.com/mokshablr/Freesend/pulls)!

---

## License

This project is licensed under the [MIT License](LICENSE).