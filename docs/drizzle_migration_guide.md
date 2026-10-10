# Drizzle ORM Migration Workflow & Deployment Strategy

This document explains how database migrations work in **nodestar**, detailing the distinction between generating migration files (`db:generate`) and applying them (`db:migrate`), alongside execution rules across local, Docker, and cloud/production environments.

---

## 1. Core Concepts: `db:generate` vs. `db:migrate`

Drizzle ORM splits database schema changes into two distinct steps to ensure safety, auditability, and version control.

| Command | Script Action | Where it runs | Should it be in Git? |
| :--- | :--- | :--- | :--- |
| **`npm run db:generate`** | Compares TypeScript schemas (`src/shared/db/*`) with existing migrations and generates new SQL files in `drizzle/`. | **Local Development ONLY** | **Yes** (Generated `.sql` files must be committed). |
| **`npm run db:migrate`** | Reads the SQL files in `drizzle/` and executes unapplied migrations against the PostgreSQL database pointed to by `DATABASE_URL`. | **ALL Environments** (Local, Docker, Production) | N/A (Executes against live database). |

---

## 2. Environment Matrix

Depending on where your database is running, the workflow differs slightly:

### A. Local Development (Native PostgreSQL)
* **Pre-requisite:** PostgreSQL installed directly on host machine (e.g., via Homebrew, installer, or `apt`).
* **Workflow:**
  1. Modify TypeScript schema (e.g., `src/shared/db/users.ts`).
  2. Run `npm run db:generate` (creates `drizzle/000X_name.sql`).
  3. Run `npm run db:migrate` (applies `.sql` to local database).

### B. Local Development (Docker Compose)
* **Pre-requisite:** Docker Desktop / Engine running `docker compose up -d postgres`.
* **Workflow:**
  1. Modify TypeScript schema locally.
  2. Run `npm run db:generate` on your host machine to create SQL files.
  3. Run `npm run db:migrate` on your host machine (targeting `localhost:5432`) **OR** execute it inside the app container:
     ```bash
     docker exec -it nodestar_api npm run db:migrate
     ```

### C. Production / Cloud Environments (Railway, Render, Neon, Supabase)
* **Pre-requisite:** Database URL provided via cloud platform environment variables (`DATABASE_URL`).
* **Workflow:**
  1. **DO NOT run `db:generate` in production.** The `.sql` files are already present in your Git repository.
  2. Run `npm run db:migrate` as part of the build/release pipeline **before** launching the API process.

---

## 3. Step-by-Step Developer Lifecycle

```
[ Modify TS Schema ] 
         │
         ▼
[ npm run db:generate ]  ──►  Generates drizzle/000X_xxx.sql
         │
         ▼
[ Git Commit & Push ]    ──►  Pushes code + SQL migration files to GitHub
         │
         ├───────────────────────────────┐
         ▼                               ▼
[ Local/Docker DB ]             [ Production DB ]
  npm run db:migrate              Automated build pipeline executes
                                  npm run db:migrate && npm start
```

### Detailed Example

1. **Schema Update:** You add a `bio` column to `users.ts`:
   ```typescript
   export const users = pgTable('users', {
     // ...
     bio: text('bio'),
   });
   ```

2. **Generate SQL:**
   ```bash
   npm run db:generate
   ```
   *Output:* File `drizzle/0001_add_bio_to_users.sql` is created containing:
   ```sql
   ALTER TABLE "users" ADD COLUMN "bio" text;
   ```

3. **Commit to Git:**
   ```bash
   git add src/shared/db/users.ts drizzle/
   git commit -m "schema: add bio column to users"
   git push origin main
   ```

4. **Apply Migration:**
   * **In Local / Docker:** Run `npm run db:migrate`.
   * **In Production (e.g., Render/Railway):** Configure start command or release hook:
     ```bash
     npm run db:migrate && npm start
     ```

---

## 4. How Drizzle Tracks Applied Migrations

Drizzle ORM automatically creates a tracking table named `__drizzle_migrations` inside your PostgreSQL database:

```sql
SELECT * FROM __drizzle_migrations;
```

When `npm run db:migrate` runs, Drizzle checks this table against the `.sql` files in `drizzle/`. It only executes SQL files that have **not yet been recorded**, preventing duplicate executions or errors.

---

## 5. Production Deployment Best Practices

1. **Automate in CI/CD / Release Phase:**
   Always run migrations prior to booting the HTTP server.
   * **Render Build Command:** `npm install && npm run build && npm run db:migrate`
   * **Railway Start Command:** `npm run db:migrate && npm start`

2. **Never Edit Existing SQL Migration Files:**
   If a schema mistake is made, create a new change in TypeScript and run `db:generate` again to produce a new migration file.

3. **Backup Production Data:**
   Before running migrations with destructive changes (e.g., dropping columns or tables), ensure a database snapshot or backup is created.
