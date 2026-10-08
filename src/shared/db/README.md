# Database Layer (`src/shared/db`)

This module encapsulates all database infrastructure, driver connections, and ORM schemas for `nodestar`. By isolating persistence logic inside `src/shared/db/`, domain modules (`src/modules/*`) remain completely decoupled from specific database engines.

---

## 🐘 Default Driver: PostgreSQL + Drizzle ORM

The default setup uses **PostgreSQL 16** via the `postgres` (Postgres.js) driver and **Drizzle ORM**.

- **Connection Client:** `src/shared/db/index.ts`
- **Schemas:** `src/shared/db/schema/` (or collocated inside domain feature modules)

---

## 🔄 Switching to MySQL (Alternative Engine Setup)

Drizzle ORM provides direct dialect abstractions. If your project requires MySQL instead of PostgreSQL, the migration is confined strictly to this directory:

### 1. Install MySQL Driver
```bash
npm uninstall postgres
npm install mysql2
