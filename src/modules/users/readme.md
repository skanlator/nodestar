## Example Architecture Guide: Adding a New Domain Module

`nodestar` enforces a modular, domain-driven structure where features live self-contained inside `src/modules/<module-name>/`. 

The walkthrough below demonstrates how to extend the boilerplate by building an **Example Users Module** (`src/modules/users/`).

---

### Target Module Structure

```text
src/modules/users/
├── users.schema.ts   # Zod input/output validation schemas
├── users.service.ts  # Business logic & Drizzle ORM database queries
└── users.routes.ts   # Express route definitions
```

---

### Step 1: Define Validation Schemas (`users.schema.ts`)

```typescript
import { z } from 'zod';

// Example Zod schema for validating request params
export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID format'),
  }),
});

export type GetUserByIdInput = z.infer<typeof getUserByIdSchema>;
```

### Step 2: Implement Business Logic (`users.service.ts`)

```typescript
import { eq } from 'drizzle-orm';
import { db } from '../../shared/db/index.ts';
import { users } from '../../shared/db/schema/users.ts';
import { AppError } from '../../shared/errors/app-error.ts';

export class UsersService {
  static async getById(id: string) {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }
}
```

### Step 3: Define Express Endpoints (`users.routes.ts`)

```typescript
import { Router } from 'express';
import { UsersService } from './users.service.ts';

export const usersRouter = Router();

// Example GET endpoint to retrieve a user profile by ID
usersRouter.get('/:id', async (req, res, next) => {
  try {
    const user = await UsersService.getById(req.params.id);
    res.json(user);
  } catch (error) {
    next(error); // Forward errors to global errorHandler
  }
});
```

### Step 4: Mount Router in Core Pipeline (`src/app.ts`)

Register the new router inside `src/app.ts` under its corresponding base path:

```typescript
import { usersRouter } from './modules/users/users.routes.ts';

// ... preceding global middlewares in app.ts

// Domain Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter); // 👈 Example module mounted here

// Global Error Handler
app.use(errorHandler);
```
