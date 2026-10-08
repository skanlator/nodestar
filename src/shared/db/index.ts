import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../../config/env.ts';

// Cliente de conexión para PostgreSQL con Postgres.js
const queryClient = postgres(env.DATABASE_URL, {
  max: env.NODE_ENV === 'production' ? 10 : 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(queryClient);

export type DatabaseInstance = typeof db;
