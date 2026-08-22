# TODOs

## Rate limiting for /api/emails endpoint
**What:** Add per-API-key rate limiting to the /api/emails (and /api/send-email) endpoints.
**Why:** Without rate limiting, a single API key can send unlimited requests, which could overwhelm the SMTP server or be abused. Important for production credibility as a Resend alternative.
**Where to start:** Look at Next.js rate limiting middleware patterns. Consider `upstash/ratelimit` for a serverless-friendly approach, or in-memory rate limiting for self-hosted instances.

