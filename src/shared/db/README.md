# Database Architecture (`src/shared/db`)

This directory isolates the application's database connection, client initialization, and migration schemas. By decoupling database logic here, domain modules (`src/modules/*`) rely entirely on abstract ORM queries without caring about the underlying engine or driver.

---

## 🐘 Active Default Engine: PostgreSQL

**`nodestar` is pre-configured out of the box to use PostgreSQL 16.**

* **Driver:** `postgres` (Postgres.js)
* **ORM:** `drizzle-orm` (`drizzle-orm/postgres-js`)
* **Connection Client:** `src/shared/db/index.ts`
* **Schema Definitions:** `src/shared/db/schema/`

### Active Connection File (`src/shared/db/index.ts`)

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../../config/env.ts';

const queryClient = postgres(env.DATABASE_URL, {
  max: env.NODE_ENV === 'production' ? 10 : 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(queryClient);

export type DatabaseInstance = typeof db;
```

---

## 🔀 Alternative Configuration: Switching to MySQL

> **Note:** The instructions below are **optional** reference guidelines for developers who wish to modify this boilerplate to use MySQL instead of the default PostgreSQL setup.

If your project requires MySQL, follow these 4 steps to adapt the database layer:

### 1. Replace Driver Dependencies
Uninstall the PostgreSQL driver and install the MySQL pool driver:

```bash
npm uninstall postgres
npm install mysql2
```

### 2. Update DB Client (`src/shared/db/index.ts`)
Replace the contents of `src/shared/db/index.ts` with the MySQL pool connection:

```typescript
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { env } from '../../config/env.ts';

const poolConnection = mysql.createPool(env.DATABASE_URL);

export const db = drizzle(poolConnection);

export type DatabaseInstance = typeof db;
```

### 3. Update Schema Exports
In your schema files (`src/shared/db/schema/*`), switch Drizzle imports from PostgreSQL dialect to MySQL dialect:

```typescript
// ❌ PostgreSQL (Default in nodestar)
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// ✅ MySQL (Alternative)
import { mysqlTable, varchar, datetime } from 'drizzle-orm/mysql-core';
```

### 4. Update `drizzle.config.ts`
Change the dialect property in `drizzle.config.ts`:

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/shared/db/schema/*',
  out: './drizzle',
  dialect: 'mysql', // Changed from 'postgresql'
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

---

## 🎯 Architectural Benefits

Because business services inside `src/modules/*/` interact solely with the exported `db` instance:
* Domain controllers, routes, and Zod schemas require **zero changes** if the database driver is replaced.
* Integration tests interact directly with the unified `db` type definition (`DatabaseInstance`).
