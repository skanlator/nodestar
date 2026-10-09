# `README.md`

# nodestar (v0.3) Node starter kit

> A modular, back-to-basics Node.js + Express starter engineered for production rigor: zero bloat, fully decoupled modules, and lightning-fast testing out of the box.

---

## 🎯 Why `nodestar`?

Most Node.js boilerplates suffer from two extremes: they are either heavily bloated commercial starters stuffed with unneeded dependencies, or quick "vibe-coded" scripts missing tests, deployment setup, and architectural docs.

`nodestar` provides a lean, rock-solid foundation that respects your time:
* **Zero Bloat:** Minimal core footprint with zero hidden abstractions.
* **Truly Decoupled:** Modules and example routes can be completely deleted in seconds without breaking the test harness.
* **Test-Driven First:** Vitest configured out of the box for execution speeds under 50ms.
* **Production Prepared:** Structured logging, type-safe environment configuration, and clean error handling.

---

## 📂 Project Architecture

```text
/
├── src/
│   ├── config/          # Environment variable validation (Zod) & app configuration
│   ├── shared/          # Global middlewares, error handlers, and core utilities
│   │   ├── db/          # Database connection, client setup, and Drizzle schemas
│   │   ├── errors/      # Custom AppError class
│   │   └── middlewares/ # Error handling and Zod validation middlewares
│   └── modules/         # Domain-driven feature modules
│       └── auth/
│           ├── auth.types.ts      # Domain interfaces & TypeScript types
│           ├── auth.schema.ts     # Zod validation schemas (DTOs)
│           ├── auth.service.ts    # Business logic & DB queries
│           ├── auth.controller.ts # Express HTTP controllers
│           ├── auth.routes.ts     # Express route definitions
│           └── auth.test.ts       # Colocated integration/unit tests
├── tests/               # Global test harness setup, fixtures, and mocks
├── docs/                # Architecture specs, deployment guides, and DB setup
├── .env.example
├── docker-compose.yml   # Local PostgreSQL database container setup
├── drizzle.config.ts    # Drizzle ORM & migration CLI configuration
├── vite.config.ts
├── vitest.config.ts
└── README.md
```

---

## 🗺️ Roadmap & Development Phases

| Phase | Focus | Core Deliverables | Status |
| :--- | :--- | :--- | :---: |
| **Phase 1** | **Foundation & Testing** | Core structure, strict Zod env parsing, global `AppError` handler, Vitest harness | 🟢 **Completed** |
| **Phase 2** | **Auth & Deploy (v0.1)** | JWT Auth module (Register/Login), bcrypt hashing, Docker & PaaS deployment docs (`docs/deploy.md`) | 🟢 **Completed** |
| **Phase 3** | **Database & ORM (v0.2)** | PostgreSQL integration via Docker Compose, Drizzle ORM schemas & migrations, DB-backed Auth | 🟢 **Completed** |
| **Phase 4** | **Security & Observability (v0.3)** | Helmet security headers, CORS, rate limiting, structured logging (Pino), refresh token rotation | 🟢 **Completed** |
| **Phase 5** | **CI/CD & DX (v0.4)** | GitHub Actions pipeline, pre-commit hooks (Husky), OpenAPI/Swagger spec generation | 🟡 **In Progress** |

---

## 🚀 Quick Start

Get your environment up and running in less than 2 minutes.

### 1. Prerequisites
Ensure you have **Node.js 20+**, **npm**, and **Docker Desktop** installed on your machine.

### 2. Setup Project

```bash
# Clone the repository
git clone https://github.com/skanlator/nodestar.git

# Navigate into the project
cd nodestar

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start PostgreSQL container
docker compose up -d

# Production dependencies
npm install helmet cors express-rate-limit pino pino-http

# Development dependencies and types
npm install -D @types/cors pino-pretty
```

---

## 🛠️ Development Commands

| Command | Action |
| --- | --- |
| `npm run dev` | Start development server with hot-reloading |
| `npm test` | Run the Vitest test suite once |
| `npm run test:watch` | Run tests in interactive watch mode |
| `npm run db:generate` | Generate SQL migration files with Drizzle Kit |
| `npm run db:migrate` | Apply database migrations to PostgreSQL |
| `npm run db:studio` | Open Drizzle Studio database GUI |
| `npm run build` | Build the project for production |
| `npm start` | Run the compiled production build |

---

## 🤝 How to Contribute
Contributions, issues, and feature requests are welcome!

If you find a bug or have suggestions for improving test execution speed or architecture, feel free to open an issue or start a discussion.

---

## 📄 License
MIT

---

### `package.json`

```json
{
  "name": "nodestar",
  "version": "0.2.0-dev",
  "description": "A modular, back-to-basics Node.js + Express starter built with tests and docs.",
  "main": "src/index.ts",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "vite build",
    "start": "node dist/index.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.4.5",
    "drizzle-orm": "^0.30.0",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "postgres": "^3.4.4",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/node": "^20.12.12",
    "@types/supertest": "^6.0.2",
    "drizzle-kit": "^0.20.14",
    "supertest": "^7.0.0",
    "tsx": "^4.10.5",
    "typescript": "^5.4.5",
    "vite": "^5.2.11",
    "vitest": "^1.6.0"
  }
}
