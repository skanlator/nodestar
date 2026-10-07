# Deployment Guide for Nodestar

This guide outlines the production deployment strategies for **nodestar**, focusing on containerized deployments using Docker and PaaS platforms like Railway and Render.

---

## 1. Environment Variables

Ensure all required production environment variables are configured in your deployment platform environment settings.

| Variable | Description | Required | Example / Default |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Application runtime environment | **Yes** | `production` |
| `PORT` | HTTP server port | Optional | `3000` (PaaS usually injects this) |
| `JWT_SECRET` | Secret key used for signing JWT tokens | **Yes** | `a_long_random_secure_secret_key` |
| `JWT_EXPIRES_IN` | JWT expiration duration | Optional | `1d` |

---

## 2. Docker Deployment

### Multi-Stage `Dockerfile`

Create a `Dockerfile` at the root of your project:

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

Create a `.dockerignore` file:

```text
node_modules
dist
.env
.git
tests
docs
```

### Building & Running Container

```bash
# Build the Docker image
docker build -t nodestar-api:latest .

# Run the container
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your_production_secret \
  --name nodestar-app \
  nodestar-api:latest
```

---

## 3. PaaS Deployment

### Railway

1. Connect your GitHub repository to [Railway](https://railway.app/).
2. Railway automatically detects Node.js apps and runs `npm run build` followed by `npm start`.
3. Add environment variables in the Railway Dashboard under **Variables**:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `your_secure_secret`
4. Set the health check path to `/health`.

### Render

1. Create a new **Web Service** on [Render](https://render.com/) linked to your repository.
2. Set runtime environment settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/index.js`
3. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `your_secure_secret`
4. Set **Health Check Path** to `/health`.

---

## 4. Health Check Verification

Once deployed, verify that the application is running by querying the health check endpoint:

```bash
curl https://your-domain.com/health
```

Expected Response:

```json
{
  "status": "ok",
  "uptime": 12.345,
  "timestamp": "2026-10-07T15:26:00.000Z"
}
```
