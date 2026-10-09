## Example Architecture Guide: Adding a Products Module

The walkthrough below demonstrates how to add a completely new **Products Module** (`src/modules/products/`) to `nodestar`.

---

### Target Module Structure

```text
src/modules/products/
├── products.schema.ts   # Zod input/output validation schemas
├── products.service.ts  # Business logic & Drizzle ORM database queries
└── products.routes.ts   # Express route definitions
```

---

### Step 1: Define Validation Schemas (`products.schema.ts`)

```typescript
import { z } from 'zod';

// Zod schema for validating product creation
export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Product name is required'),
    price: z.number().positive('Price must be greater than 0'),
    description: z.string().optional(),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
```

### Step 2: Implement Business Logic (`products.service.ts`)

```typescript
import { eq } from 'drizzle-orm';
import { db } from '../../shared/db/index.ts';
import { products } from '../../shared/db/schema/products.ts';
import { AppError } from '../../shared/errors/app-error.ts';
import type { CreateProductInput } from './products.schema.ts';

export class ProductsService {
  static async create(input: CreateProductInput['body']) {
    const [newProduct] = await db
      .insert(products)
      .values({
        name: input.name,
        price: input.price.toString(),
        description: input.description,
      })
      .returning();

    return newProduct;
  }

  static async getById(id: string) {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }
}
```

### Step 3: Define Express Endpoints (`products.routes.ts`)

```typescript
import { Router } from 'express';
import { ProductsService } from './products.service.ts';

export const productsRouter = Router();

// GET /api/products/:id - Get product by ID
productsRouter.get('/:id', async (req, res, next) => {
  try {
    const product = await ProductsService.getById(req.params.id);
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// POST /api/products - Create a new product
productsRouter.post('/', async (req, res, next) => {
  try {
    const product = await ProductsService.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});
```

### Step 4: Mount Router in Core Pipeline (`src/app.ts`)

Register the new router inside `src/app.ts` under its corresponding base path:

```typescript
import { productsRouter } from './modules/products/products.routes.ts';

// ... preceding global middlewares in app.ts

// Domain Routes
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter); // 👈 New products module mounted here

// Global Error Handler
app.use(errorHandler);
```
