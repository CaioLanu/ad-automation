# AD Automation

O **AD Automation** é uma aplicação full-stack para apoiar rotinas administrativas que envolvem usuários, permissões e filas operacionais. A ideia do projeto é concentrar essas tarefas em um painel seguro, com autenticação, controle de acesso e registro das operações realizadas.

<<<<<<< HEAD
Nesta fase, o projeto trabalha com um **Active Directory fictício**, modelado em tabelas SQL. Ou seja: ele simula a gestão de usuários e grupos em banco de dados, sem integração direta com um domínio AD real.
=======
- `backend/`: API backend.
- `frontend/`: front único da aplicação, em React 19 + Vite + TypeScript + Tailwind.
>>>>>>> b8238c6 (Alterações no frontend, estruturação do dashboard de importação dos usuários.)

## O que o projeto resolve

Em muitos ambientes administrativos, processos como criação de usuários, revisão de permissões, importação de planilhas e acompanhamento de solicitações acabam ficando espalhados entre planilhas, sistemas internos e tarefas manuais.

Este projeto propõe uma base para organizar esse fluxo em uma aplicação única, com:

- login administrativo;
- permissões por perfil;
- operações protegidas no backend;
- persistência em banco relacional;
- auditoria das ações executadas;
- interface web para acompanhar e operar as filas.

## Funcionalidades atuais

- Autenticação com RG e senha.
- Sessão com access token e refresh token.
- Logout com revogação de sessão.
- Validação de permissão antes de exibir o painel administrativo.
- CRUD protegido para usuários do AD fictício.
- Associação entre usuários e grupos.
- Registro de auditoria para operações administrativas.
- Fila de tarefas SEI com filtros, status e edição manual.
- Importação de tarefas SEI por arquivo XLSX.
- Interface responsiva com suporte a tema claro e escuro.

## Stack utilizada

| Camada | Tecnologias |
|---|---|
| Runtime | Bun |
| Backend | TypeScript, Express, Zod, JWT, bcryptjs |
| Banco de dados | MySQL |
| ORM | Prisma |
| Frontend | React, Vite, TypeScript |
| Interface | Tailwind CSS, componentes estilo shadcn/ui, lucide-react |
| Infra local | Docker Compose |
| Importação de planilhas | xlsx |

## Estrutura do projeto

```text
ad-automation/
├── backend/                 # API, autenticação, regras de negócio e Prisma
│   ├── prisma/              # Schema e migrations do banco de dados
│   └── src/
│       ├── application/     # Serviços, validações e contratos
│       ├── config/          # Configuração de ambiente
│       ├── infrastructure/  # Rotas HTTP, middlewares e repositórios
│       └── shared/          # Utilitários compartilhados
├── frontend/                # Aplicação React/Vite
│   └── src/
│       ├── components/      # Telas, layout, dashboard, SEI e UI
│       └── lib/             # Cliente API, autenticação, storage e tema
├── docker/                  # Scripts de apoio para Docker
├── docker-compose.yml       # Banco MySQL local
└── package.json             # Scripts principais do workspace
```

## Como rodar localmente

### Pré-requisitos

Antes de começar, você precisa ter instalado:

- [Bun](https://bun.sh/)
- Docker
- Docker Compose

### 1. Instale as dependências

```bash
bun install
```

### 2. Configure as variáveis de ambiente

Crie os arquivos `.env` a partir dos exemplos do repositório:

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

Depois, preencha os valores conforme o seu ambiente local.

Principais variáveis usadas pelo projeto:

| Variável | Uso |
|---|---|
| `PORT` | Porta da API backend. |
| `DATABASE_URL` | Conexão do Prisma com o MySQL. |
| `SHADOW_DATABASE_URL` | Banco shadow usado pelo Prisma Migrate. |
| `JWT_ACCESS_SECRET` | Segredo usado no access token. |
| `JWT_REFRESH_SECRET` | Segredo usado no refresh token. |
| `CORS_ORIGIN` | Origem autorizada a acessar a API. |
| `ADMIN_RG` | RG do administrador inicial. |
| `ADMIN_PASSWORD` | Senha do administrador inicial. |
| `ADMIN_NAME` | Nome do administrador inicial. |
| `VITE_API_URL` | URL da API usada pelo frontend. |
| `MYSQL_DATABASE` | Nome do banco MySQL local. |
| `MYSQL_USER` | Usuário MySQL da aplicação. |
| `MYSQL_PASSWORD` | Senha do usuário MySQL da aplicação. |
| `MYSQL_ROOT_PASSWORD` | Senha do root no MySQL. |
| `MYSQL_PORT` | Porta exposta pelo MySQL local. |

> Não coloque senhas, tokens ou strings de conexão reais no código ou na documentação.

### 3. Suba o banco de dados

```bash
bun run db:up
```

### 4. Rode as migrations e gere o Prisma Client

```bash
bun run db:migrate
bun run db:generate
```

### 5. Crie o administrador inicial

```bash
bun run seed:admin
```

### 6. Inicie o backend

```bash
bun run dev:backend
```

### 7. Inicie o frontend

Em outro terminal:

```bash
bun run dev:frontend
```

Por padrão, o frontend roda em `http://localhost:5173`.

## Banco de dados

O schema do banco fica em:

```text
backend/prisma/schema.prisma
```

Os principais modelos são:

- `SystemUser`: usuários que acessam o painel.
- `Session`: sessões autenticadas e refresh tokens.
- `AdUser`: usuários do AD fictício.
- `AdGroup`: grupos do AD fictício.
- `AdUserGroup`: vínculo entre usuários e grupos.
- `AuditLog`: histórico de ações administrativas.
- `SeiImportBatch`: lotes de importação de planilhas SEI.
- `SeiTask`: tarefas SEI criadas ou importadas.

O Prisma também usa um banco shadow durante as migrations. Em volumes Docker novos, esse banco é criado automaticamente pelo script `docker/mysql/init-shadow-db.sh`. Se você já tinha um volume MySQL criado antes dessa configuração, crie o banco shadow manualmente e ajuste a variável `SHADOW_DATABASE_URL`.

## Autenticação e permissões

O acesso ao painel depende de autenticação JWT. Depois do login, o frontend valida a sessão e só libera o dashboard quando a permissão do usuário é compatível.

As regras sensíveis ficam no backend:

- o frontend nunca acessa diretamente as tabelas administrativas;
- rotas de AD exigem usuário autenticado e autorizado;
- rotas de tarefas SEI exigem permissão `ADMINISTRATORS`;
- o logout revoga a sessão vinculada ao refresh token.

## Endpoints principais

### Saúde

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/health` | Verifica se a API está respondendo. |

### Autenticação

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/login` | Autentica o usuário e retorna os tokens. |
| `POST` | `/auth/refresh` | Renova o access token. |
| `POST` | `/auth/logout` | Encerra a sessão atual. |

### Usuários AD fictício

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/ad/users` | Lista usuários. |
| `GET` | `/ad/users/:id` | Busca um usuário por ID. |
| `POST` | `/ad/users` | Cria um usuário. |
| `PATCH` | `/ad/users/:id` | Atualiza um usuário. |
| `DELETE` | `/ad/users/:id` | Desativa um usuário. |

### Tarefas SEI

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/sei/tasks` | Lista tarefas com filtros. |
| `POST` | `/sei/tasks` | Cria uma tarefa manualmente. |
| `PATCH` | `/sei/tasks/:id` | Atualiza uma tarefa. |
| `POST` | `/sei/tasks/import` | Importa tarefas a partir de XLSX. |

## Scripts úteis

| Script | Descrição |
|---|---|
| `bun run dev` | Inicia o backend. |
| `bun run dev:backend` | Inicia o backend. |
| `bun run dev:frontend` | Inicia o frontend. |
| `bun run build:backend` | Compila o backend. |
| `bun run build:frontend` | Valida tipos e gera o build do frontend. |
| `bun run typecheck:backend` | Executa typecheck do backend. |
| `bun run typecheck:frontend` | Executa typecheck do frontend. |
| `bun run db:up` | Sobe o MySQL via Docker Compose. |
| `bun run db:down` | Derruba os serviços Docker. |
| `bun run db:migrate` | Executa migrations do Prisma. |
| `bun run db:generate` | Gera o Prisma Client. |
| `bun run db:studio` | Abre o Prisma Studio. |
| `bun run seed:admin` | Cria o administrador inicial. |

## Status do projeto

O projeto está em desenvolvimento ativo.

Já existe uma base funcional com autenticação, banco de dados, painel administrativo e fluxo de importação SEI. As próximas evoluções devem focar em completar as telas de CRUD no frontend, melhorar a visualização de auditoria, expandir a gestão de grupos/diretórios e adicionar testes automatizados.

## Segurança

Algumas decisões de segurança já fazem parte da base do projeto:

- segredos ficam em variáveis de ambiente;
- permissões são verificadas no backend;
- entradas da API são validadas com Zod;
- sessões usam refresh tokens revogáveis;
- operações administrativas são registradas em auditoria.

## Licença

Este projeto ainda não possui uma licença pública definida.
