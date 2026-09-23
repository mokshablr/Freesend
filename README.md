<img src="./public/freesend-icon.png" width="100" alt="Freesend logo" />

# Freesend - Your Email API Using Your Infrastructure!

## Overview

**Freesend** is a lightweight email API built for developers who want full control over email delivery without the complexity or cost of third-party platforms.

Self-host it on your own infrastructure and send emails through a simple HTTP API using **your own SMTP provider** (like Gmail, Zoho, Mailgun, etc.).

Designed with **serverless apps, indie hackers, and backend engineers** in mind, Freesend is powered entirely by **your own SMTP server**.

No vendor lock-in. No usage caps. No surprise pricing.

> _"I needed to send 1-2k emails/day from my serverless app. Freesend just worked, and saved me time and money."_  
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
✅ **Free & Open Source / Self-Hosted**  

Ideal for:

- Serverless apps that need reliable transactional emails
- Startups who want full transparency & control
- Developers who value simplicity and clean open-source code

---

## 🔄 Migrating from Resend?

Freesend is **Resend SDK-compatible**. If you're already using the `resend` npm package, switch to Freesend with one environment variable. Zero code changes.

```bash
# Just add this to your .env
RESEND_BASE_URL=https://your-freesend-instance.com/api
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
- 🔐 **Encrypted Credentials & Rate Limiting** - SMTP passwords encrypted at rest, per-key request limits

---

## 🐳 Self-Hosting with Docker

The quickest way to run Freesend is with Docker and Docker Compose. It bundles the app and a PostgreSQL database, and uses the internal Docker network so the database is never exposed to the host.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) 20.10+
- [Docker Compose](https://docs.docker.com/compose/install/) v2+
- A Google OAuth client (Client ID + Client Secret) for sign-in. See the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).

### 1. Clone the repo

```bash
git clone https://github.com/mokshablr/Freesend.git
cd Freesend
```

### 2. Create `.env` and fill in secrets

```bash
cp .env.example .env
```

`.env.example` has a generation command above each secret. Fill in `AUTH_SECRET`, `ENCRYPTION_KEY`, `ENCRYPTION_IV`, `POSTGRES_PASSWORD`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and (optionally) `NEXT_PUBLIC_APP_URL` (default: `http://localhost:5000`). Leave `DATABASE_URL` blank; Docker Compose builds it from `POSTGRES_PASSWORD`.

### 3. Start the containers

```bash
docker compose up -d
```

The app will be available at [http://localhost:5000](http://localhost:5000). On first start, the database schema is synced automatically.

### Important notes

- **`NEXT_PUBLIC_APP_URL` is baked in at build time.** Next.js inlines `NEXT_PUBLIC_*` variables into the client bundle. To change the public URL, rebuild the image:
  ```bash
  docker compose build --no-cache app && docker compose up -d
  ```
- **Never rotate `ENCRYPTION_KEY` or `ENCRYPTION_IV` after first use.** All stored SMTP passwords become unrecoverable. Back these values up alongside your database.
- **Postgres is not published to the host.** The app reaches it over the internal Docker network. If you need local `psql` access, uncomment the `ports` block in `docker-compose.yml`.
- **Schema changes that would drop data fail by design.** The container runs `prisma db push` without `--accept-data-loss`, so destructive migrations require manual intervention. Back up the `pgdata` volume first, then run:
  ```bash
  docker compose exec app ./node_modules/.bin/prisma db push --accept-data-loss --skip-generate
  ```

### Production considerations

- Put Freesend behind a reverse proxy (Caddy, nginx, Traefik) to terminate HTTPS.
- Back up the `pgdata` Docker volume regularly.
- Keep `.env` out of version control (it is already gitignored).

---

## 👨‍💻 Quick Start (Self-Hosted)

Deploy Freesend on your own infrastructure, then send emails via the API:

### API URL
```
http://localhost:3000/api/send-email
```

### Example Usage (Node.js)
```js
const sendEmail = async () => {
  const url = "http://localhost:3000/api/send-email";
  const apiKey = "YOUR_API_KEY"; // From your Freesend instance dashboard

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

## 🔐 Security

### API keys

Keys look like `fsk_live_9f2a7c41b8e35d06a1c9f4e72b8d5a30`: a `fsk_live_`
prefix so a leaked key is recognisable in logs and matchable by secret scanners,
followed by 128 bits of randomness. Keys issued before this format existed are
bare UUIDs and keep working, since authentication compares the key to the stored
value exactly and never inspects its shape.

### SMTP passwords

Stored encrypted with AES-256-CBC under `ENCRYPTION_KEY`, using a fresh random
initialisation vector per password. Older releases reused a single IV from
`ENCRYPTION_IV`; that variable is now ignored, and passwords written by those
releases still decrypt, so upgrading needs no migration. To retire the old
ciphertexts entirely, run:

```bash
node --env-file=.env scripts/reencrypt-smtp-passwords.mjs          # preview
node --env-file=.env scripts/reencrypt-smtp-passwords.mjs --commit # apply
```

### Rate limiting

Each API key is limited to **100 requests per 60 seconds**, shared across
`POST /api/send-email` and `POST /api/emails`. Responses carry `RateLimit-Limit`,
`RateLimit-Remaining` and `RateLimit-Reset`; a `429` adds `Retry-After`. Tune it
with `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW_MS`, or set `RATE_LIMIT_MAX=0` to
turn it off.

> **The limit is per process, not distributed.** Counters live in the memory of
> the Node process serving the request, so behind a load balancer or with forked
> workers the effective limit is roughly `RATE_LIMIT_MAX` times the number of
> processes, and all counters reset on restart. It is a safety valve against one
> runaway client saturating your SMTP relay, not an exact quota. For a hard
> global limit, put nginx `limit_req`, Cloudflare, or a Redis-backed limiter in
> front of Freesend.

---

## 🚀 Official SDKs

Use an official SDK for a better developer experience.

| Language       | Install | Documentation |
|----------------|---------|----------------|
| **JavaScript/TypeScript** | `npm install @freesend/sdk` | [JS/TS SDK docs](sdk/javascript/README.md) |
| **Python**     | `pip install freesend` | [Python SDK docs](sdk/python/README.md) |

---

## 💡 Real Use Cases

- Seamlessly send **transactional emails** from your JAMstack or serverless app: signups, OTPs, receipts & more
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
- [JavaScript/TypeScript SDK](sdk/javascript/README.md) · [Python SDK](sdk/python/README.md)
- [Contributing](CONTRIBUTING.md)
- [Resend Migration Guide](docs/resend-migration-guide.md)

---

## 🔗 Projects Using Freesend

- [grovv.app](https://grovv.app) – A spreadsheet‑powered **sales CRM for SMBs** that uses Freesend to send transactional emails.
- [mar.toolhub.live](https://mar.toolhub.live) – A certificate generation platform for MAR point submissions, using Freesend to deliver 1,000–2,000 official, QR-verified emails daily via Gmail SMTP.


Want to be listed? [Open a PR](https://github.com/mokshablr/Freesend/pulls)!

---

## License

This project is licensed under the [MIT License](LICENSE).