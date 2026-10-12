## Execution Flow Representations

### A. Registration Flow (`POST /api/auth/register`)

```text
[ Client / Test ] 
       │
       ▼ (HTTP POST with JSON body)
[ Express App (`src/app.ts`) ]
       │
       ▼
[ Route Router (`auth.routes.ts`) ]
       │
       ▼
[ Middleware: validateRequest (Zod Schema) ] ──(If invalid)──> [ ZodError / AppError (400) ]
       │ (If valid)
       ▼
[ AuthController.register ]
       │
       ▼
[ AuthService.register ]
       ├──> 1. Drizzle DB: Check if email exists ──(If exists)──> Throw AppError (409)
       ├──> 2. PasswordService: Hash password
       ├──> 3. Drizzle DB: Insert new user
       └──> 4. JwtService: Generate Access & Refresh tokens
       │
       ▼
[ Response 201 Created ({ status: 'success', data: { user, tokens } }) ]

```

---

### B. Login Flow (`POST /api/auth/login`)

```text
[ Client / Test ] 
       │
       ▼ (HTTP POST: email & password)
[ validateRequest (LoginSchema) ] ──> [ AuthController.login ] ──> [ AuthService.login ]
                                                                        │
                                       ┌────────────────────────────────┘
                                       ▼
                         1. Drizzle DB: Find user by email ──(Not found)──> Throw AppError (401)
                         2. PasswordService: Compare passwords ──(Invalid)─> Throw AppError (401)
                         3. JwtService: Generate new tokens
                         4. Drizzle DB: Save refresh token record
                                       │
                                       ▼
                         [ Response 200 OK ({ status: 'success', data: { user, tokens } }) ]

```

---

### C. Protected Routes Flow (`GET /api/auth/me`)

```text
[ Client / Test ]
       │
       ▼ (HTTP GET with Header: Authorization: Bearer <accessToken>)
[ Express Router ]
       │
       ▼
[ authenticate Middleware (`auth.middleware.ts`) ]
       ├──> 1. Extract Bearer token from header ──(Missing)──> Throw AppError (401)
       ├──> 2. JwtService.verifyAccessToken(token) ──(Invalid/Expired)──> Throw AppError (401)
       └──> 3. Attach payload to `req.user`
       │
       ▼
[ AuthController.me ] ──> Returns `req.user` profile data in `response.body.data.user`

```

---

### D. Global Error Handling Flow (`error.middleware.ts`)

```text
[ Any Error Thrown in Route/Service ]
       │
       ▼ (Passed via next(err))
[ Express Global Error Middleware (`errorHandler`) ]
       ├──> Is it an `AppError`? ───────────> Return `res.status(err.statusCode).json(...)`
       ├──> Is it a `ZodError`? ───────────> Format messages & return `res.status(400).json(...)`
       └──> Unhandled standard Error ──────> Console.error & return `res.status(500).json({ message: 'Internal server error' })`

```

---

### E. Automated Testing Lifecycle Flow (`Vitest` + `Supertest`)

```text
[ npm test (Vitest) ]
       │
       ▼
[ Test File (`auth.test.ts`) ]
       │
       ├──> `beforeEach`: Cleans up test user from real/test DB (`db.delete(users)...`)
       ├──> `request(app).post('/api/auth/register').send(...)` 
       │         └─ Spun up directly against the Express app instance in memory
       │
       └──> `expect(response.status).toBe(...)` 
                 └─ Compares Supertest's response against expectations

```
