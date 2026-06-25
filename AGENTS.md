# AGENTS.md

## Product Intent

- Build this as a production-ready automation product, not a prototype or scaffold.
- `idea.md` is only an early ideation note; do not treat it as the source of truth.
- The first production slice is authenticated user CRUD against a fictional Active Directory stored in SQL tables.

## Core Constraints

- Only `ADMIN` users may access or mutate the fictional AD SQL tables.
- Keep AD SQL access behind backend authorization; never expose it directly to the frontend.
- Any sensitive information, including passwords, tokens, secrets, credentials, keys, and connection strings, must always live in `.env` or environment variables. Never hardcode sensitive values in source code, documentation, config files, Docker Compose, tests, seeds, or examples. Examples may use placeholder environment variable names only.
- Prioritize authentication, authorization, validation, persistence, and auditability before SEI/email automation.
- Do not add unverified commands here until the corresponding config/scripts exist.

## Intended Stack

- Runtime/package manager/bundler: Bun.
- Backend: TypeScript, Express, Prisma, JWT auth, CORS, Zod validation.
- Database: MySQL.
- Frontend: React 19 with shadcn/ui.
- Infra: Docker.
- Data analysis: Python.

## Future Agent Notes

- Once manifests exist, document exact Bun commands for install, dev, build, lint, typecheck, test, and Prisma workflows.
- Once Prisma exists, document migration and client generation commands.
- Once Docker exists, document required services and startup order.
- Trust executable config over prose when scripts and configuration are added.
