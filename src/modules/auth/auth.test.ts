import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../app.ts';
import { db } from '../../shared/db/index.ts';
import { users } from '../../shared/db/users.ts';
import { PasswordService } from '../../shared/utils/password.ts';

describe('Auth Module Integration Tests (/api/auth)', () => {
  const testUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'StrongP@ssword123!',
  };

  // Clean up users table before each test
  beforeEach(async () => {
    await db.delete(users);
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully and return 201', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(testUser.email.toLowerCase());
      expect(response.body.data.user.name).toBe(testUser.name);
      expect(response.body.data.user.passwordHash).toBeUndefined(); // Sensitive field omitted
    });

    it('should return 409 Conflict if email is already registered', async () => {
      // Register initial user
      await request(app).post('/api/auth/register').send(testUser);

      // Attempt duplicate registration
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(409);
      expect(response.body.message).toMatch(/already registered/i);
    });

    it('should return validation error if password does not meet complexity rules', async () => {
      const weakUser = {
        ...testUser,
        password: '123', // Fails min length & complexity
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(weakUser);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Pre-register user directly or via API
      await request(app).post('/api/auth/register').send(testUser);
    });

    it('should authenticate user and return access & refresh tokens', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
      expect(response.body.data.user.email).toBe(testUser.email.toLowerCase());
    });

    it('should return 401 Unauthorized for invalid password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: 'WrongPassword123!',
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/invalid email or password/i);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should issue new access & refresh tokens when given a valid refresh token', async () => {
      await request(app).post('/api/auth/register').send(testUser);
      const loginRes = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      const { refreshToken } = loginRes.body.data.tokens;

      const refreshRes = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.data.tokens.accessToken).toBeDefined();
      expect(refreshRes.body.data.tokens.refreshToken).toBeDefined();
    });

    it('should return 401 Unauthorized for an invalid or revoked refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid.jwt.token' });

      expect(response.status).toBe(401);
    });
  });

  describe('Protected Routes (GET /api/auth/me & POST /api/auth/logout)', () => {
    let accessToken: string;
    let refreshToken: string;

    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(testUser);
      const loginRes = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      accessToken = loginRes.body.data.tokens.accessToken;
      refreshToken = loginRes.body.data.tokens.refreshToken;
    });

    it('GET /api/auth/me - should return profile for authenticated user', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.user.email).toBe(testUser.email.toLowerCase());
    });

    it('GET /api/auth/me - should return 401 if Authorization header is missing', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
    });

    it('POST /api/auth/logout - should revoke refresh token', async () => {
      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(logoutRes.status).toBe(200);

      // Attempting to refresh after logout should fail
      const refreshRes = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(refreshRes.status).toBe(401);
    });
  });
});
