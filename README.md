# nodestar

A production-ready, modular Node.js API boilerplate built with **Express**, **TypeScript**, **Drizzle ORM**, **Zod**, and **Pino**. Designed for high security, observability, type safety, and scalability out of the box.

---

## 🚀 Key Features

- **TypeScript Native:** Strict type checking and clean developer experience.
- **Modular Domain Architecture:** Code organized by business domains (`src/modules/*`) for maintainability.
- **Robust Security:**
  - **Helmet:** Automated HTTP security header hardening.
  - **CORS:** Configurable origin policy via environment schema.
  - **Tiered Rate Limiting:** Global protection (100 req/15 min) + strict authentication endpoint protection (10 req/15 min).
- **Observability & Logging:**
  - **Pino & Pino-HTTP:** Fast, structured JSON logging with pretty-printing in development.
  - **Healthcheck Endpoint (`GET /health`):** Real-time monitoring of app status, uptime, and PostgreSQL connectivity ping.
- **Type-Safe Validation:** Request/Response validation powered by **Zod** and validated environment variables.
- **Database & ORM:** **Drizzle ORM** configured for PostgreSQL with type-safe schema management.
- **Integration Testing:** Pre-configured **Vitest** + **Supertest** suite covering security headers, rate limits, CORS, and health status.

---

## 📁 Project Structure

```text
nodestar/
├── src/
│   ├── config/
│   │   └── env.ts                     # Validated Zod environment configuration
│   ├── shared/
│   │   ├── db/                        # Drizzle ORM database connection & schemas
│   │   ├── errors/                    # AppError class & custom error types
│   │   ├── logger/                    # Pino structured logger instance
│   │   └── middlewares/
│   │       ├── error-handler.ts       # Global error processing middleware
│   │       └── rate-limiter.ts        # Global and auth-specific rate limiters
│   ├── modules/
│   │   └── auth/                      # Domain module example (schema, service, routes)
│   │       ├── auth.schema.ts
│   │       ├── auth.service.ts
│   │       └── auth.routes.ts
│   ├── app.ts                         # Core Express app pipeline assembly
│   ├── app.test.ts                    # Core infrastructure & security integration tests
│   └── server.ts                      # Server initialization & entrypoint
├── .env.example
├── vitest.config.ts
└── package.json
```

---

## ⚙️ Environment Variables

All environment variables are parsed and validated on application startup in `src/config/env.ts`.

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | `development \| production \| test` | `development` | Runtime environment |
| `PORT` | `number` | `3000` | HTTP server port |
| `DATABASE_URL` | `string (URL)` | *Required* | PostgreSQL connection string |
| `JWT_SECRET` | `string` | *Required* | Secret key for signing JWT tokens |
| `JWT_EXPIRES_IN` | `string` | `1d` | JWT token expiration duration |
| `LOG_LEVEL` | `fatal \| error \| warn \| info \| debug \| trace` | `info` | Pino log level verbosity |
| `CORS_ORIGIN` | `string` | `*` | Allowed CORS origin header |

---

## 🛠️ Getting Started

### 1. Installation

```bash
# Clone the repository
git clone [https://github.com/your-username/nodestar.git](https://github.com/your-username/nodestar.git)
cd nodestar

# Install dependencies
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and fill in your database credentials:

```bash
cp .env.example .env
```

### 3. Database Migration

```bash
npm run db:generate
npm run db:migrate
```

### 4. Running the Application

```bash
# Development mode with hot reloading
npm run dev

# Production build & start
npm run build
npm start
```

### 5. Running Tests

```bash
# Run integration test suite
npm test
```

---

## 🌐 Infrastructure Endpoints & Security

### Health Check Endpoint
- **`GET /health`**
  - **Status 200 OK:** Returned when API is running and PostgreSQL ping succeeds.
  - **Status 503 Service Unavailable:** Returned if database connection fails.
  - **Response Payload:**
    ```json
    {
      "status": "ok",
      "timestamp": "2026-10-09T12:00:00.000Z",
      "uptime": 124.52,
      "database": "connected"
    }
    ```

### Rate Limiting Rules
1. **Global Limiter (`globalRateLimiter`):** Applied to all domain routes. Allows up to **100 requests** per 15-minute window per IP.
2. **Auth Limiter (`authRateLimiter`):** Applied specifically to sensitive routes (e.g., `/api/auth/login`). Allows up to **10 requests** per 15-minute window per IP. Exceeding this limit returns HTTP `429 Too Many Requests`.

---

## 📐 Architecture Guide: Adding a New Module

`nodestar` uses a domain-driven modular structure where features reside in `src/modules/<module-name>/`.

### Steps to Add a New Domain Module (e.g., `products`):

1. **Create the module folder structure:**
   ```text
   src/modules/products/
   ├── products.schema.ts
   ├── products.service.ts
   └── products.routes.ts
   ```

2. **Define Validation Schemas (`products.schema.ts`):**
   ```typescript
   import { z } from 'zod';

   export const createProductSchema = z.object({
     body: z.object({
       name: z.string().min(1, 'Product name is required'),
       price: z.number().positive('Price must be greater than 0'),
     }),
   });
   ```

3. **Implement Business Logic (`products.service.ts`):**
   ```typescript
   import { db } from '../../shared/db/index.ts';
   import { products } from '../../shared/db/schema/products.ts';

   export class ProductsService {
     static async create(data: { name: string; price: number }) {
       const [newProduct] = await db.insert(products).values(data).returning();
       return newProduct;
     }
   }
   ```

4. **Define Router (`products.routes.ts`):**
   ```typescript
   import { Router } from 'express';
   import { ProductsService } from './products.service.ts';

   export const productsRouter = Router();

   productsRouter.post('/', async (req, res, next) => {
     try {
       const product = await ProductsService.create(req.body);
       res.status(201).json(product);
     } catch (error) {
       next(error);
     }
   });
   ```

5. **Register Router in Core Pipeline (`src/app.ts`):**
   ```typescript
   import { productsRouter } from './modules/products/products.routes.ts';

   // Domain Routes
   app.use('/api/auth', authRouter);
   app.use('/api/products', productsRouter); // 👈 New module registered
   ```

---

## 📄 License

This project is licensed under the MIT License.
