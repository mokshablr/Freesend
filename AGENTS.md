# AGENTS.md - Developer Guidelines for Freesend

Freesend is a Next.js email API that lets developers send email through their own SMTP infrastructure. This file is for AI coding agents — for human setup instructions see `CONTRIBUTING.md`.

## Project Structure

```
/actions             # Next.js server actions
/app                 # Next.js App Router
  /(auth)/           # Login/signup pages
  /(docs)/           # Documentation pages
  /(marketing)/      # Landing, pricing, blog
  /(protected)/      # Authenticated dashboard/settings
  /api/              # API routes
/components          # React components
  /ui/               # shadcn/ui primitives
/lib                 # Utilities and server logic
  /validations/      # Zod schemas
/prisma              # Database schema
/sdk/javascript/     # JS/TS SDK (npm package)
/sdk/python/         # Python SDK (PyPI package)
```

---

## Commands

### Main App (root)

```bash
npm run dev          # Start dev server (Next.js)
npm run turbo        # Start dev server (Turbopack)
npm run build        # Production build
npm run preview      # Build + preview production
npm run start        # Start production server (port 5000)
npm run lint         # ESLint
npm run email        # React Email dev server (port 3333)
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma db push   # Push schema changes to database
```

### JavaScript SDK (`sdk/javascript/`)

```bash
npm run build                           # Compile TypeScript
npm run dev                             # Watch mode
npm run test                            # Run all tests
npm run test -- --testPathPattern=client.test.ts  # Run single file
npm run test -- --coverage              # With coverage
```

### Python SDK (`sdk/python/`)

```bash
pip install -e ".[dev]"   # Install with dev dependencies
pytest                    # Run all tests
pytest tests/test_client.py  # Run single file
black .                   # Format code
flake8 .                  # Lint
mypy freesend/            # Type check
```

---

## Code Style

### Formatting (Prettier — run automatically on save)

Config is in `prettier.config.js`. Key rules:
- Double quotes, semicolons, trailing commas (all), 2-space indent, LF line endings, print width 80
- Import order is enforced by `@ianvs/prettier-plugin-sort-imports` — do not manually reorder imports; Prettier will sort them

### TypeScript

- Explicit types for function parameters and return values; avoid `any`
- Path alias `@/` for all internal imports (configured in tsconfig)
- Components: PascalCase (`DashboardClient`); files: kebab-case for pages, PascalCase for components
- Functions/variables: camelCase; true constants: UPPER_SNAKE_CASE
- Use `"use client"` directive for client components
- Use `cn()` from `@/lib/utils` for conditional Tailwind class merging

### API Routes

- Place in `app/api/`; use Next.js App Router conventions
- Validate request bodies with Zod schemas from `lib/validations/`
- Return appropriate HTTP status codes

### Database

- Use Prisma Client; follow `prisma/schema.prisma` for model definitions
- Run `npx prisma generate` after any schema change

### Python SDK

- Follow PEP 8; use `black` for formatting
- Type annotations required on all public functions
- Use `unittest` + `unittest.mock` for tests (matches existing suite)

---

## Git Workflow

Before opening a PR, run:

```bash
npm run lint    # Must pass with no errors
npm run build   # Must complete without errors
```

For Python SDK changes, also run `pytest` and `flake8`.

Commit messages: imperative mood, present tense (e.g. `Add reply-to support`, not `Added`).

---

## Boundaries

**Always:**
- Run `npm run lint` before marking a task complete on the main app
- Run `pytest` before marking a task complete on the Python SDK
- Run `npx prisma generate` after editing `prisma/schema.prisma`
- Use Zod for all request body validation in API routes

**Ask first:**
- Adding new npm or PyPI production dependencies
- Changes to `prisma/schema.prisma` that require a migration
- Modifying authentication logic in `auth.ts` / `auth.config.ts`

**Never:**
- Commit `.env` files or secrets
- Run `npm run build` during development (use `npm run dev`)
- Skip type checking when adding new TypeScript files
