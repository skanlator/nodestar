import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from './app.ts';

describe('Application Core & Infrastructure Middleware Tests', () => {
  describe('GET /health', () => {
    it('should return 200 OK with health status and database connectivity', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('database', 'connected');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(typeof response.body.uptime).toBe('number');
    });
  });

  describe('Security Middlewares (Helmet & CORS)', () => {
    it('should include security headers set by Helmet', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['x-dns-prefetch-control']).toBe('off');
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
      expect(response.headers['strict-transport-security']).toBeDefined();
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should include correct CORS headers in responses', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://example.com');

      expect(response.headers['access-control-allow-origin']).toBe('*');
    });
  });

  describe('Rate Limiting Middleware', () => {
    it('should include standard rate limit headers on rate-limited endpoints', async () => {
      const response = await request(app).get('/api/auth/non-existent-route');

      expect(response.headers['ratelimit-limit']).toBeDefined();
      expect(response.headers['ratelimit-remaining']).toBeDefined();
      expect(response.headers['ratelimit-reset']).toBeDefined();
    });

    it('should return 429 Too Many Requests when rate limit threshold is exceeded', async () => {
      // authRateLimiter allows a maximum of 10 requests per 15-minute window
      const initialRequests = Array.from({ length: 10 }, () =>
        request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com', password: 'Password123!' })
      );

      // Execute 10 consecutive requests to consume the allowance
      await Promise.all(initialRequests);

      // The 11th request triggers HTTP 429 Too Many Requests
      const exceededResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'Password123!' });

      expect(exceededResponse.status).toBe(429);
      expect(exceededResponse.body).toHaveProperty(
        'message',
        'Too many authentication attempts, please try again later.'
      );
    });
  });
});
