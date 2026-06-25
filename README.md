# ad-automation

## Estrutura

- `src/`: API backend existente.
- `frontend/`: base React 19 + Vite + TypeScript + Tailwind.

## Rodar

1. Copie `.env.example` para `.env` e preencha os valores.
2. Copie `frontend/.env.example` para `frontend/.env` e ajuste `VITE_API_URL`.
3. Instale as dependências na raiz (`bun install`).
4. Suba o banco: `bun run db:up`.
5. Gere as migrations/client: `bun run db:migrate` e `bun run db:generate`.
6. Crie o primeiro admin: `bun run seed:admin`.
7. Inicie a API: `bun run dev`.
8. Em outro terminal, inicie o frontend: `bun run dev:frontend`.

## Banco de shadow do Prisma

`prisma migrate dev` precisa de um banco shadow. Em Docker, um volume novo cria esse banco automaticamente via `docker/mysql/init-shadow-db.sh`.

Se o volume MySQL já existia antes dessa configuração, crie o banco shadow uma vez com PowerShell:

```powershell
docker exec ad_automation_mysql sh -c 'shadow_db="${MYSQL_SHADOW_DATABASE:-${MYSQL_DATABASE}_shadow}"; mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS \`$shadow_db\`; GRANT ALL PRIVILEGES ON \`$shadow_db\`.* TO ''$MYSQL_USER''@''%''; FLUSH PRIVILEGES;"'
```

Depois, configure `SHADOW_DATABASE_URL` no `.env` apontando para esse banco shadow.

## Fluxo de teste

1. Faça login no frontend com a conta `ADMIN`.
2. O cliente decodifica o JWT e bloqueia acesso caso o role não seja `ADMIN`.
3. Use o `accessToken` como `Bearer <token>` nos endpoints `/ad/users`.
4. Para logout, o frontend chama `POST /auth/logout` com o `refreshToken` salvo em `localStorage`.

## Endpoints

- `GET /health`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /ad/users`
- `GET /ad/users/:id`
- `POST /ad/users`
- `PATCH /ad/users/:id`
- `DELETE /ad/users/:id`
