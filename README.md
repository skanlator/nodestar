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
