# AGENTS.md - Developer Guidelines for Freesend

This file provides guidelines and commands for AI agents working on this codebase.

## Project Overview

Freesend is a Next.js email API application that allows developers to send emails through their own SMTP infrastructure. The codebase consists of:

- **Main App**: Next.js 14 application with TypeScript, Prisma, and shadcn/ui
- **SDK**: JavaScript/TypeScript SDK in `sdk/javascript/`
- **Stack**: Next.js, React 18, Prisma, PostgreSQL, Tailwind CSS, Zod

---

## Commands

### Main Application (Root)

```bash
# Development
npm run dev          # Start Next.js dev server
npm run turbo        # Start with Turbopack

# Build & Production
npm run build        # Build for production
npm run preview      # Build and preview production
npm run start        # Start production server (port 5000)

# Linting
npm run lint         # Run ESLint

# Email Development
npm run email        # Start React Email dev server (port 3333)

# Database
npm run postinstall  # Generate Prisma client (runs automatically after npm install)
```

### JavaScript SDK (`sdk/javascript/`)

```bash
# Build
npm run build        # Compile TypeScript
npm run dev          # Watch mode

# Testing
npm run test                    # Run all tests
npm run test -- client.test.ts  # Run single test file
npx jest --testPathPattern=client.test.ts  # Alternative

# Coverage
npm run test -- --coverage
```

---

## Code Style Guidelines

### TypeScript

- Use explicit types for function parameters and return types
- Use `any` sparingly - prefer specific types or `unknown`
- Enable `strictNullChecks` in tsconfig
- Example:
  ```typescript
  // Good
  export function formatDate(input: string | number): string {
    const date = new Date(input);
    return date.toLocaleDateString("en-US", { ... });
  }

  // Avoid
  export function formatDate(input) { ... }
  ```

### Imports

- Use path alias `@/` for local imports (configured in tsconfig)
- Group imports in this order:
  1. External libraries (React, Next.js)
  2. UI components (shadcn/ui)
  3. Internal lib utilities
  4. Local components
- Example:
  ```typescript
  import { useState, useEffect, useCallback } from "react";
  import { Mail, KeyRound } from "lucide-react";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { getCurrentUser } from "@/lib/session";
  import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
  ```

### Naming Conventions

- **Components**: PascalCase (`DashboardClient`, `MailServerTable`)
- **Functions/Variables**: camelCase (`getCurrentUser`, `fetchDashboardData`)
- **Files**: kebab-case for pages (`dashboard-page.tsx`), PascalCase for components
- **Interfaces**: PascalCase with `Props` suffix for component props (`DashboardClientProps`)
- **Constants**: UPPER_SNAKE_CASE for true constants, camelCase for other values

### React Components

- Use `"use client"` directive for client components
- Prefer function declarations for page components:
  ```typescript
  export default async function DashboardPage() { ... }
  ```
- Prefer arrow functions for client components:
  ```typescript
  export function DashboardClient({ prop1, prop2 }: Props) { ... }
  ```
- Destructure props in function signature
- Extract complex interfaces to top of file

### Error Handling

- Use try/catch for async operations
- Display user-friendly errors with toast notifications:
  ```typescript
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error('Failed to fetch');
    }
    const data = await response.json();
  } catch (error) {
    console.error('Error:', error);
    toast({
      title: "Operation Failed",
      description: "Please try again later.",
      variant: "destructive",
    });
  }
  ```

### UI/Styling

- Use Tailwind CSS with shadcn/ui components
- Use `cn()` utility for conditional class merging:
  ```typescript
  import { cn } from "@/lib/utils";
  <div className={cn("base-class", condition && "conditional-class")} />
  ```
- Follow shadcn/ui patterns for component structure
- Use semantic HTML elements

### Database (Prisma)

- Use Prisma Client for database operations
- Follow model definitions in `prisma/schema.prisma`
- Generate client after schema changes: `npx prisma generate`

### Validation

- Use Zod for form validation
- Define schemas in `lib/validations/`
- Example:
  ```typescript
  import { z } from "zod";
  export const EmailSchema = z.object({
    to: z.string().email(),
    subject: z.string().min(1),
    body: z.string().optional(),
  });
  ```

### API Routes

- Place in `app/api/` directory
- Use Next.js App Router conventions
- Return appropriate HTTP status codes
- Use Zod for request body validation

---

## Directory Structure

```
/app                 # Next.js App Router pages
  /(auth)/          # Auth pages (login, etc.)
  /(marketing)/     # Marketing pages (landing, pricing, blog)
  /(protected)/     # Authenticated pages (dashboard, settings)
  /api/             # API routes
/components/        # React components
  /ui/              # shadcn/ui components
  /dashboard/       # Feature-specific components
/lib/               # Utility functions
  /validations/     # Zod schemas
/prisma/            # Database schema
/sdk/javascript/    # JS/TS SDK
```

---

## Testing Guidelines

- Tests go in `__tests__/` directories
- Use `.test.ts` extension
- Follow AAA pattern (Arrange, Act, Assert)
- Example:
  ```typescript
  describe("EmailClient", () => {
    it("should send email successfully", async () => {
      // Arrange
      const client = new EmailClient(apiKey);
      
      // Act
      const result = await client.send({ to: "test@example.com", subject: "Test" });
      
      // Assert
      expect(result.success).toBe(true);
    });
  });
  ```

---

## Common Tasks

### Adding a New Page
1. Create file in appropriate `app/` subdirectory
2. Add `export const metadata` for SEO
3. Use async/await for server components
4. Import and use components from `@/components/`

### Adding a New Component
1. Follow existing component patterns in `/components/`
2. Use TypeScript interfaces for props
3. Use `cn()` for className handling
4. Export as named export

### Database Changes
1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push` or migrations
3. Run `npx prisma generate` to update client
