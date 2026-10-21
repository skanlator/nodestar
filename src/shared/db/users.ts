import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: varchar('id', { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  
  // Stores the AES-256-GCM encrypted email string (needs 'text' due to IV + auth tag length)
  email: text('email').notNull(),
  
  // Deterministic HMAC-SHA256 hash for secure database lookups and unique constraint enforcement
  emailHash: varchar('email_hash', { length: 64 }).notNull().unique(),
  
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }),
  role: varchar('role', { length: 20 }).default('user').notNull(),
  refreshToken: text('refresh_token'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

