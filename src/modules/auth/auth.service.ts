import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../../shared/db/index.ts';
import { users } from '../../shared/db/schema/users.ts';
import { AppError } from '../../shared/errors/app-error.ts';
import { env } from '../../config/env.ts';
import type { LoginInput, RegisterInput } from './auth.schema.ts';

export class AuthService {
  static async register(input: RegisterInput) {
    // 1. Verificar si el email ya existe en la base de datos
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // 2. Hashear la contraseña
    const passwordHash = await bcrypt.hash(input.password, 10);

    // 3. Insertar nuevo usuario en PostgreSQL
    const [newUser] = await db
      .insert(users)
      .values({
        email: input.email,
        passwordHash,
        name: input.name,
      })
      .returning();

    // 4. Generar token JWT
    const token = jwt.sign({ sub: newUser.id }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    // 5. Excluir passwordHash de la respuesta
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    return { user: userWithoutPassword, token };
  }

  static async login(input: LoginInput) {
    // 1. Buscar usuario por email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // 2. Validar hash de la contraseña
    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    // 3. Generar token JWT
    const token = jwt.sign({ sub: user.id }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    // 4. Excluir passwordHash de la respuesta
    const { passwordHash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }
}
