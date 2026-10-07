import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { AppError } from '../src/shared/errors/app-error.ts';
import { errorHandler } from '../src/shared/middlewares/error.middleware.ts';

describe('Error Handler Middleware', () => {
  it('should return custom status and message for operational AppError', async () => {
    const app = express();
    app.get('/test-app-error', () => {
      throw new AppError(400, 'Invalid input provided');
    });
    app.use(errorHandler);

    const response = await request(app).get('/test-app-error');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      message: 'Invalid input provided',
    });
  });

  it('should return 500 status and generic message for unexpected errors', async () => {
    // Silenciamos console.error para no ensuciar la salida de los tests
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const app = express();
    app.get('/test-unhandled-error', () => {
      throw new Error('Unexpected database failure');
    });
    app.use(errorHandler);

    const response = await request(app).get('/test-unhandled-error');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      status: 'error',
      message: 'Internal server error',
    });

    consoleSpy.mockRestore();
  });
});
