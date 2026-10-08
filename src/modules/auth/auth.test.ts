import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { db } from '../../shared/db/index.ts';
import { users } from '../../shared/db/schema/users.ts';
import { app } from '../../app.ts';

describe('Auth Module Integration Tests (PostgreSQL)', () => {
  // Limpieza de la base de datos antes de cada test para garantizar aislamiento total
  beforeEach(async () => {
    await db.delete(users);
  });

  describe('POST /api/auth/register', () => {
    it('debería registrar un nuevo usuario en PostgreSQL y devolver token JWT', async () => {
      const payload = {
        email: 'dev@nodestar.io',
        password: 'Password123!',
        name: 'Nodestar Developer',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toMatchObject({
        email: payload.email,
        name: payload.name,
      });
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('debería retornar conflicto (409) cuando el email ya existe en la base de datos', async () => {
      const payload = {
        email: 'duplicate@nodestar.io',
        password: 'Password123!',
      };

      // Primer registro
      await request(app).post('/api/auth/register').send(payload);

      // Intento de registro duplicado
      const response = await request(app)
        .post('/api/auth/register')
        .send(payload);

      expect(response.status).toBe(409);
      expect(response.body.message).toMatch(/already registered/i);
    });
  });

  describe('POST /api/auth/login', () => {
    it('debería autenticar correctamente un usuario existente en PostgreSQL', async () => {
      const credentials = {
        email: 'user@nodestar.io',
        password: 'SecurePassword123!',
      };

      // Crear usuario previo
      await request(app).post('/api/auth/register').send(credentials);

      // Probar login
      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(credentials.email);
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('debería rechazar credenciales inválidas con estado 401', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@nodestar.io',
          password: 'WrongPassword!',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/invalid email or password/i);
    });
  });
});
