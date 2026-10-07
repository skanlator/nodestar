import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index.ts';

describe('GET /health', () => {
  it('should return status 200 and healthy server payload', async () => {
    const startTime = performance.now();

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'ok',
    });
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('timestamp');

    const executionTime = performance.now() - startTime;
    expect(executionTime).toBeLessThan(100);
  });
});
