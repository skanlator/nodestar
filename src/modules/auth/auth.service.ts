import { eq } from 'drizzle-orm';
import { db } from '../../shared/db/index.ts';
import { users } from '../../shared/db/users.ts';
import { PasswordService } from '../../shared/utils/password.ts';
import { JwtService } from '../../shared/utils/jwt.ts';
import { AppError } from '../../shared/errors/app-error.ts';
import type { RegisterInput, LoginInput, RefreshTokenInput } from './auth.schema.ts';

export class AuthService {
  /**
   * Registers a new user and hashes their password.
   */
  static async register(input: RegisterInput) {
    // 1. Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (existingUser) {
      throw new AppError('Email is already registered', 409);
    }

    // 2. Hash password
    const passwordHash = await PasswordService.hash(input.password);

    // 3. Insert user into database
    const [newUser] = await db
      .insert(users)
      .values({
        name: input.name,
        email: input.email,
        passwordHash,
        role: 'user',
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });

    return newUser;
  }

  /**
   * Authenticates user, verifies password, and issues tokens.
   */
  static async login(input: LoginInput) {
    // 1. Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // 2. Verify password
    const isValidPassword = await PasswordService.verify(user.passwordHash, input.password);

    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    // 3. Generate tokens
    const tokenPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = JwtService.generateAccessToken(tokenPayload);
    const refreshToken = JwtService.generateRefreshToken(tokenPayload);

    // 4. Save refresh token in database
    await db
      .update(users)
      .set({ refreshToken })
      .where(eq(users.id, user.id));

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  /**
   * Rotates access token using a valid refresh token.
   */
  static async refresh(input: RefreshTokenInput) {
    let payload;
    try {
      payload = JwtService.verifyToken(input.refreshToken);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Check if refresh token matches the database record
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1);

    if (!user || user.refreshToken !== input.refreshToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Issue new tokens
    const tokenPayload = { sub: user.id, email: user.email, role: user.role };
    const newAccessToken = JwtService.generateAccessToken(tokenPayload);
    const newRefreshToken = JwtService.generateRefreshToken(tokenPayload);

    // Update database with new refresh token
    await db
      .update(users)
      .set({ refreshToken: newRefreshToken })
      .where(eq(users.id, user.id));

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Revokes user refresh token to log out.
   */
  static async logout(userId: string) {
    await db
      .update(users)
      .set({ refreshToken: null })
      .where(eq(users.id, userId));
  }
}
