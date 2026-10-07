# nodestar Node starter kit

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
│   ├── config/          # Environment variable validation (Zod) & DB setup
│   ├── shared/          # Global middlewares, error handlers, and core utilities
│   └── modules/         # Domain-driven feature modules
│       └── auth/
│           ├── auth.types.ts      # Domain interfaces & TypeScript types
│           ├── auth.schema.ts     # Zod validation schemas (DTOs)
│           ├── auth.service.ts    # Business logic (hashing, token generation)
│           ├── auth.controller.ts # Express HTTP controllers
│           ├── auth.routes.ts     # Express route definitions
│           └── auth.test.ts       # Colocated integration/unit tests
├── tests/               # Global test harness setup, fixtures, and mocks
├── docs/                # Architecture specs, module removal guides, and deployment docs
├── .env.example
├── vite.config.ts
├── vitest.config.ts
└── README.md
```
---

## 🗺️ Roadmap & Development Phases

| Phase | Focus | Core Deliverables | Status |
| :--- | :--- | :--- | :---: |
| **Phase 1** | **Foundation & Testing** | Project structure, TypeScript config, Vitest setup (<50ms smoke test), `.env` validation | 🟢 **Completed** |
| **Phase 2** | **Auth, Tests & Deploy (v0.1)** | Secure Signup/Login flow, colocated `auth.test.ts`, password hashing, basic deployment guide | 🟡 **In Progress** |
| **Phase 3** | **Core API & Architecture** | Standardized API response format, global error middleware, modular CRUD pattern | ⚪ **Planned** |
| **Phase 4** | **Production Rigor & Docs** | Integration HTTP test suite, "how to strip code" guide, CI/CD & Deployment config | ⚪ **Planned** |
| **Phase 5** | **Frontend Integration** | Optional lightweight GUI layer (SolidJS or React) | ⚪ **Planned** |

---

## 🚀 Quick Start

Get your environment up and running in less than 2 minutes.

### 1. Prerequisites
Ensure you have **Node.js 20+** and **npm** installed on your machine.

### 2. Setup Project

```bash
# Clone the repository
git clone [https://github.com/your-username/nodestar.git](https://github.com/your-username/nodestar.git)
cd nodestar

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```
---

### 3. Development Commands

| Command | Action |
| --- | --- |
| `npm run dev` | Start development server with hot-reloading |
| `npm test` | Run the Vitest test suite once |
| `npm run test:watch` | Run tests in interactive watch mode |
| `npm run build` | Build the project for production |
| `npm start` | Run the compiled production build |

---

## 🤝 How to Contribute
Contributions, issues, and feature requests are welcome!

As the project is currently in Phase 1, the priority is keeping the core footprint minimal and decoupled. If you find a bug or have suggestions for improving test execution speed or architecture, feel free to open an issue or start a discussion.

## 📄 License
MIT

---

### `package.json`

```json
{
  "name": "nodestar",
  "version": "0.1.0",
  "description": "A modular, back-to-basics Node.js + Express starter built with tests and docs.",
  "main": "src/index.ts",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "vite build",
    "start": "node dist/index.js",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.12.12",
    "supertest": "^7.0.0",
    "@types/supertest": "^6.0.2",
    "tsx": "^4.10.5",
    "typescript": "^5.4.5",
    "vite": "^5.2.11",
    "vitest": "^1.6.0"
  }
}
