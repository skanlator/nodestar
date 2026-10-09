# Deployment Guide for Nodestar

This guide outlines the production and containerized deployment strategies for **nodestar**, incorporating Docker, Docker Compose with PostgreSQL, and PaaS platforms like Railway and Render.

---

## 1. Environment Variables

Configure these environment variables in your runtime environment or `.env` file before launching the application.

| Variable | Description | Required | Example / Default |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Application runtime environment | **Yes** | `production` |
| `PORT` | HTTP server port | Optional | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | **Yes** | `postgres://nodestar_user:nodestar_password@postgres:5432/nodestar_db` |
| `JWT_SECRET` | Secret key used for signing JWT tokens | **Yes** | `a_long_random_secure_secret_key` |
| `JWT_EXPIRES_IN` | JWT access token expiration duration | Optional | `15m` |
| `REFRESH_TOKEN_EXPIRES_IN` | JWT refresh token expiration duration | Optional | `7d` |

---

## 2. Docker & Docker Compose Setup

### Multi-Stage `Dockerfile`

Create a `Dockerfile` at the root of your project to compile and run the Node.js API:

```dockerfile
# --- Stage 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: Production Runtime ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

USER node

CMD ["node", "dist/index.js"]
```

### `.dockerignore`

Create a `.dockerignore` file in the root directory:

```text
node_modules
dist
.env
.git
tests
docs
```

### Full Stack `docker-compose.yml`

Integrate your PostgreSQL service with the API service into a unified `docker-compose.yml`:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: nodestar_api
    restart: always
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgres://nodestar_user:nodestar_password@postgres:5432/nodestar_db
      JWT_SECRET: super_secret_jwt_key_change_in_production
    depends_on:
      postgres:
        condition: service_healthy

  postgres:
    image: postgres:16-alpine
    container_name: nodestar_postgres
    restart: always
    environment:
      POSTGRES_USER: nodestar_user
      POSTGRES_PASSWORD: nodestar_password
      POSTGRES_DB: nodestar_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U nodestar_user -d nodestar_db"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

---

## 3. Local & Containerized Execution

### Launching the Stack

Run the application stack in detached mode:

```bash
docker compose up -d --build
```

### Applying Database Migrations

Once the services are healthy, run Drizzle ORM migrations inside the app container or locally:

```bash
# Executed via local environment targeting the running DB:
npm run db:migrate

# Or executed directly inside the app container:
docker exec -it nodestar_api npm run db:migrate
```

---

## 4. PaaS Deployment Strategies

### Railway

1. Connect your GitHub repository to [Railway](https://railway.app/).
2. Provision a **PostgreSQL** plugin/service from the Railway Dashboard.
3. Link your Node.js application service. Railway will automatically inject `DATABASE_URL` and execute `npm run build` followed by `npm start`.
4. Define additional **Variables**:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `your_secure_secret`
5. Execute migrations using Railway CLI or build hooks:
   ```bash
   railway run npm run db:migrate
   ```

### Render

1. Create a **PostgreSQL Database** instance on [Render](https://render.com/).
2. Create a new **Web Service** linked to your repository.
3. Set runtime environment settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build && npm run db:migrate`
   - **Start Command**: `node dist/index.js`
4. Add Environment Variables under **Environment**:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = `<Internal Database URL from Render Postgres>`
   - `JWT_SECRET` = `your_secure_secret`
5. Set **Health Check Path** to `/health`.

---

## 5. Health Check Verification

Verify system operational status by querying the health check endpoint:

```bash
curl http://localhost:3000/health
```

Expected Response:

```json
{
  "status": "ok",
  "uptime": 12.345,
  "timestamp": "2026-10-09T17:32:00.000Z"
}
```
