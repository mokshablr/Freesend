# TODOs

## Rate limiting for /api/emails endpoint
**What:** Add per-API-key rate limiting to the /api/emails (and /api/send-email) endpoints.
**Why:** Without rate limiting, a single API key can send unlimited requests, which could overwhelm the SMTP server or be abused. Important for production credibility as a Resend alternative.
**Where to start:** Look at Next.js rate limiting middleware patterns. Consider `upstash/ratelimit` for a serverless-friendly approach, or in-memory rate limiting for self-hosted instances.

## Docker Compose for self-hosting
**What:** Add a Dockerfile and docker-compose.yml that bundles the Next.js app + PostgreSQL for one-command self-hosting.
**Why:** Self-hosters are a primary audience (r/selfhosted). Currently there's no easy way to deploy Freesend without manual setup. A `docker compose up` experience would significantly improve adoption.
**Where to start:** Create a multi-stage Dockerfile for the Next.js app. Add a docker-compose.yml with postgres and the app services. Include environment variable templates.
