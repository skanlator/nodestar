# nodestar

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
│           ├── auth.controller.ts
│           ├── auth.service.ts
│           ├── auth.schemas.ts
│           └── auth.test.ts   # Colocated tests next to module logic
├── tests/               # Global test harness setup, fixtures, and mocks
├── docs/                # Architecture specs, module removal guides, and deployment docs
├── .env.example
├── vite.config.ts
├── vitest.config.ts
└── README.md
```
## 🗺️ Roadmap & Development Phases
[x] Phase 1: Foundation & Test Harness

Project directory structure & TypeScript configuration

Fast Vitest execution setup (<50ms smoke test baseline)

Type-safe .env schema validation

[ ] Phase 2: Security & Authentication Baseline

Secure Signup / Login flow

Password hashing & security best practices

Session / JWT token handling

[ ] Phase 3: Core API Architecture

Standardized API response format & global error middleware

Modular CRUD example pattern

[ ] Phase 4: Production Rigor & Docs

Integration test suite for HTTP endpoints

Modularization guide: How to strip sample code without breaking tests

CI/CD & Deployment configuration

[ ] Phase 5: Lightweight Frontend Integration

Optional GUI layer integration (SolidJS or React)

🚀 Quick Start
