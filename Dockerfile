# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json ./
# --ignore-scripts skips postinstall (prisma generate). Deferring the generate
# step to the builder stage means schema edits don't bust the deps cache.
RUN npm ci --ignore-scripts

FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate

# Secrets are not available at image build time; t3-env's runtime validation
# still runs at container start.
ARG SKIP_ENV_VALIDATION=1
ENV SKIP_ENV_VALIDATION=$SKIP_ENV_VALIDATION

# Next.js inlines NEXT_PUBLIC_* into the client bundle, so the public URL is
# fixed at build time. Rebuild the image to change it.
ARG NEXT_PUBLIC_APP_URL=http://localhost:5000
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

RUN npm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# Generated content, imported via the `content-collections` alias.
COPY --from=builder --chown=nextjs:nodejs /app/.content-collections/generated ./.content-collections/generated
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# Prisma engines are version-matched to the generated client; copying them
# from the builder avoids a network install and keeps them in sync.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
RUN mkdir -p node_modules/.bin \
    && ln -s ../prisma/build/index.js node_modules/.bin/prisma \
    && chown -h nextjs:nodejs node_modules/.bin/prisma

COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs

EXPOSE $PORT

ENTRYPOINT ["./docker-entrypoint.sh"]
