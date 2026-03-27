Run the full preflight check before deploying. This catches API contract mismatches, type errors, and build failures that would break the site at runtime.

Steps:
1. Run `npx vitest run` — contract tests verify that every page's expected API response shape matches what the route actually returns, and that SQL queries have proper NULL safety
2. Run `npx tsc --noEmit` — full type check across the project
3. Run `DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/db" npm run build` — full Next.js production build

Report results clearly. If any step fails, explain what broke and fix it before proceeding. Do NOT skip steps or mark failures as warnings.
