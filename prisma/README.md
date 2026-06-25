# Database scaffold

This project uses Bun, Prisma, MySQL, and Docker for the database layer.

## Commands

```sh
bun install
bun run db:up
bun run db:generate
bun run db:migrate
bun run db:studio
bun run db:down
```

Copy `.env.example` to `.env` before running Prisma commands.

## Security and data invariants

- Database data is protected backend data; the frontend must never connect directly to MySQL or fictional AD tables.
- Store password and session token hashes only. Never store plaintext credentials or refresh tokens.
- Later AD read/write endpoints must require authenticated `ADMIN` users.
- A valid AD user requires `rg`, `name`, `adId`, and at least one group membership (`memberOf`). Enforce this in a backend transaction when creating or updating AD users.
