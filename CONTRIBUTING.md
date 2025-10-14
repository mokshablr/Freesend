## Contributing to Freesend

Thanks for taking the time to contribute! This document explains how to set up the project locally, make changes, and submit high‑quality pull requests.

### Project stack
- **Framework**: Next.js (App Router) with TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **Auth**: NextAuth
- **DB/ORM**: Prisma

### Prerequisites
- Node.js LTS (v18+ recommended)
- npm (bundled with Node)
- A PostgreSQL database (local or cloud)

### 1) Fork and clone
```bash
git clone https://github.com/<your-username>/Freesend.git
cd Freesend
git remote add upstream https://github.com/mokshablr/Freesend.git
```

### 2) Environment variables
Create a `.env.local` file in the repository root by making a copy of the `.env.example` file.

### 3) Install dependencies
```bash
npm i
```

### 4) Database setup (Prisma)
```bash
npx prisma generate
npx prisma migrate dev
```

### 5) Run the app
```bash
npm run dev
```
The app should be available at `http://localhost:3000`.

### Code style & quality
- TypeScript: prefer explicit types for exported APIs; avoid `any`.
- Keep functions small and readable; use meaningful names.
- Follow existing formatting and structure.
- Avoid catching errors without meaningful handling.

### Git workflow
- Create a feature branch from `main`:
  ```bash
  git checkout -b <concise-name>
  ```
- Keep your branch up to date:
  ```bash
  git fetch upstream
  git rebase upstream/main
  ```

### Testing your change
- Run the dev app and manually verify affected flows.
- Ensure no type errors remain in the IDE/CI.

### Submitting a pull request
1. Ensure lint/format are clean and the app runs locally.
2. Push your branch and open a PR against `main`.
3. Be responsive to review feedback; small, focused PRs are easier to review.

### Security
If you discover a security vulnerability, please do not open a public issue. Instead, email the maintainers.

### Questions
Unsure about anything? Open a draft PR early or start a discussion. We appreciate your contributions!


