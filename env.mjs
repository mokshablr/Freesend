import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // This is optional because it's only used in development.
    // See https://next-auth.js.org/deployment.
    NEXTAUTH_URL: z.string().url().optional(),
    AUTH_SECRET: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    // GITHUB_OAUTH_TOKEN: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    // Rate limiting for the public send endpoints, per API key and per
    // process. Set RATE_LIMIT_MAX to 0 to disable the limiter entirely.
    RATE_LIMIT_MAX: z.coerce.number().int().min(0).default(100),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1000).default(60000),
    // RESEND_API_KEY: z.string().min(1),
    // EMAIL_FROM: z.string().min(1),
    // STRIPE_API_KEY: z.string().min(1),
    // STRIPE_WEBHOOK_SECRET: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().min(1),
    // NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID: z.string().min(1),
    // NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID: z.string().min(1),
    // NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID: z.string().min(1),
    // NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID: z.string().min(1),
  },
  runtimeEnv: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    // GITHUB_OAUTH_TOKEN: process.env.GITHUB_OAUTH_TOKEN,
    DATABASE_URL: process.env.DATABASE_URL,
    // The `.trim() || undefined` is load-bearing, not cosmetic.
    // z.coerce.number() turns "" into 0, and 0 is the "disabled" sentinel, so
    // a bare `RATE_LIMIT_MAX=` left in a copied .env would silently switch the
    // limiter off. Falling through to undefined lets the zod default apply.
    RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX?.trim() || undefined,
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS?.trim() || undefined,
    // RESEND_API_KEY: process.env.RESEND_API_KEY,
    // EMAIL_FROM: process.env.EMAIL_FROM,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    // Stripe
    // STRIPE_API_KEY: process.env.STRIPE_API_KEY,
    // STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    // NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID:
    //   process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID,
    // NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID:
    //   process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID,
    // NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID:
    //   process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID,
    // NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID:
    //   process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID,
  },
  // `next lint` loads next.config.js, which imports this file. Linting needs
  // no runtime config, so `npm run lint` must not fail on a missing .env.
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === "lint",
});
