# Features & Core Architecture for Nodestar (v0.4.0)

This document provides a technical overview of the primary features, security standards, and architectural patterns implemented in **nodestar**, focusing on Domain-Driven Design (DDD), end-to-end type safety, and production-grade AuthN/AuthZ.

---

## 1. Domain-Driven Modular Architecture

The application is structured into autonomous modules under `src/modules/`. Each module encapsulates its own routes, services, schemas, and domain logic to maintain strict boundaries and scalability.

```typescript
// Autonomous module router (src/modules/auth/auth.routes.ts)
import { Router } from 'express';
import { AuthService } from './auth.service.ts';
import { registerSchema } from './auth.schema.ts';
import { validateRequest } from '../../shared/middlewares/validate-request.ts';

export const authRouter = Router();

authRouter.post('/register', validateRequest(registerSchema), async (req, res, next) => {
  try {
    const user = await AuthService.register(req.body);
    res.status(201).json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
});

```

---

## 2. Authentication & Dual-Token Security

Follows OWASP security practices by combining **Argon2id** for memory-hard password hashing with a dual-token JWT architecture (short-lived Access Tokens and long-lived Refresh Tokens).

| Mechanism | Implementation | Expiration / Configuration | Purpose |
| --- | --- | --- | --- |
| **Password Hashing** | Argon2id | `memoryCost`: 64MB, `timeCost`: 3 | GPU/ASIC-resistant password storage |
| **Access Token** | JWT (`jsonwebtoken`) | 15 minutes | Stateless authorization for protected endpoints |
| **Refresh Token** | JWT + Database | 7 days (with database rotation) | Session persistence and token revocation |

```typescript
// Password service using Argon2id (src/shared/utils/password.ts)
import argon2 from 'argon2';

export class PasswordService {
  static async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
    });
  }

  static async verify(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }
}

```

---

## 3. Role-Based Access Control (RBAC)

Authorization is handled through middleware layer evaluation. Routes specify authorized roles (`user`, `admin`, etc.), returning `403 Forbidden` if the user's token context lacks necessary privileges.

```typescript
// RBAC Middleware (src/shared/middlewares/authorize.ts)
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error.ts';

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError('Forbidden: Insufficient permissions', 403));
    }
    next();
  };
};

// Route protection example
authRouter.get('/admin/dashboard', authenticate, authorize('admin'), adminController);

```

---

## 4. Strict Request Validation (Zod)

Incoming payloads are validated and sanitized against strict Zod schemas before hitting controller logic. Email normalizations (`toLowerCase`, `trim`) and complex password rules are enforced at the network boundary.

```typescript
// Auth Schema Definition (src/modules/auth/auth.schema.ts)
import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(50),
    email: z.string().email().toLowerCase().trim(),
    password: z
      .string()
      .min(8)
      .max(100)
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/[0-9]/, 'Must contain a number')
      .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
  }),
});

```

---

## 5. Type-Safe Database Layer (Drizzle ORM)

Database schemas are defined in TypeScript using Drizzle ORM, providing type inference for table queries, selections, and inserts directly mapped to PostgreSQL.

```typescript
// Database Schema (src/shared/db/users.ts)
import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: varchar('id', { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }),
  role: varchar('role', { length: 20 }).default('user').notNull(),
  refreshToken: text('refresh_token'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

```

---

## 6. Automated Integration Testing Suite

Comprehensive E2E test coverage built with Vitest and Supertest validates entire HTTP request-response cycles, database persistence, JWT validation, and token rotation workflows.

```typescript
// Integration Test Suite (src/modules/auth/auth.test.ts)
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app.ts';
import { db } from '../../shared/db/index.ts';
import { users } from '../../shared/db/users.ts';

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await db.delete(users);
  });

  it('should authenticate user and return access and refresh tokens', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'StrongP@ssword123!',
    });

    const response = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'StrongP@ssword123!',
    });

    expect(response.status).toBe(200);
    expect(response.body.data.tokens.accessToken).toBeDefined();
    expect(response.body.data.tokens.refreshToken).toBeDefined();
  });
});

```
