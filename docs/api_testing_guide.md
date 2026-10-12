# API Testing Guide

This document outlines how to test the core authentication and user management endpoints of the **nodestar** application using `curl`.

---

## Prerequisites

Ensure your development server is running locally:
```bash
npm run dev

```

The server will be available at `http://localhost:3000`.

---

## Authentication Endpoints

### 1. Register a New User

Creates a new user account in the database. The password must satisfy security requirements (including a special character).

* **Endpoint:** `POST /api/auth/register`
* **Content-Type:** `application/json`

**cURL Command:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "user@example.com",
    "password": "StrongPassword123!"
  }'

```

---

### 2. Log In

Authenticates user credentials and returns both an `accessToken` and a `refreshToken`.

* **Endpoint:** `POST /api/auth/login`
* **Content-Type:** `application/json`

**cURL Command:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "StrongPassword123!"
  }'

```

*Save the `accessToken` and `refreshToken` strings from the JSON response for the next steps.*

---

### 3. Refresh Token

Issues a new pair of access and refresh tokens when provided with a valid refresh token.

* **Endpoint:** `POST /api/auth/refresh`
* **Content-Type:** `application/json`

**cURL Command:**

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'

```

---

### 4. Access Protected Route (`/api/auth/me`)

Retrieves the profile details of the currently authenticated user using the JWT Bearer token.

* **Endpoint:** `GET /api/auth/me`
* **Header:** `Authorization: Bearer <YOUR_ACCESS_TOKEN>`

**cURL Command:**

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

```

```

¡Guarda este contenido en tu archivo `.md` y tu documentación quedará impecable y lista para cualquier prueba!

```
