# nodestar Node starter kit

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

The project follows a modular and scalable architecture designed for maintainability and clean separation of concerns:

```text
nodestar/
├── drizzle/                  # Generated SQL migration files (Drizzle Kit)
├── src/
│   ├── modules/
│   │   └── auth/             # Authentication & User Management Module
│   │       ├── auth.controller.ts # Request handlers for register, login, and profile
│   │       ├── auth.routes.ts     # Route definitions (/register, /login, /me)
│   │       ├── auth.schema.ts     # Zod validation schemas with strong password rules
│   │       ├── auth.service.ts    # Business logic, security, and token handling
│   │       ├── auth.test.ts       # Test suite for authentication flows
│   │       └── auth.types.ts      # TypeScript interfaces (UserPayload, AuthResponse)
│   ├── shared/
│   │   ├── db/
│   │   │   ├── schema/       # Database table schemas and relations
│   │   │   │   ├── index.ts  # Central schema exports
│   │   │   │   └── users.ts  # Users table definition
│   │   │   ├── index.ts      # Drizzle database client initialization & connection
│   │   │   └── migrate.ts    # Database migration execution script
│   │   ├── logger/           # Pino structured logging configuration
│   │   │   └── index.ts      # Logger instance setup
│   │   ├── middlewares/      # Reusable Express middlewares
│   │   │   ├── auth.middleware.ts     # JWT verification middleware for protected routes
│   │   │   └── validate-request.ts    # Zod validation middleware wrapper
│   │   └── utils/            # Shared helper functions & services
│   │       └── jwt.ts        # JWT generation, verification & token utilities
│   ├── types/                # Global TypeScript type definitions
│   │   └── express.d.ts      # Express Request extensions (e.g., req.user payload)
│   └── index.ts              # Application entry point, Express app & server bootstrap
├── .env                      # Local environment variables (git-ignored)
├── .env.example              # Environment variables template
├── drizzle.config.ts         # Drizzle ORM configuration and SSL settings
├── package.json              # Project dependencies, scripts, and metadata
├── tsconfig.json             # TypeScript compiler options
└── README.md                 # Project documentation
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
https://github.com/skanlator/nodestar.git
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

### Fixing Permissions for Vitest Cache

The `EACCES` error occurs because some directories or files inside your `node_modules` folder were accidentally created with `root` privileges (usually from running a command like `npm install` with `sudo`), which prevents Vitest and Node.js from writing to the `.vite` cache directory.

To restore the correct permissions back to your user profile, run the following command in the root of your project:

```bash
sudo chown -R $USER:$USER .

```
After running this command, your user will own all project files again, and your tests or development commands will run smoothly without any permission blocks.

```bash
# Run integration test suite
npm test
```
###Tip

If you ever need to generate a secure random 32-byte hex key in your terminal, you can run:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
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
