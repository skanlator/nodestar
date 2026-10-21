import { eq } from 'drizzle-orm';
import { db } from '../../shared/db/index';
import { users } from '../../shared/db/users';
import { PasswordService } from '../../shared/utils/password';
import { JwtService } from '../../shared/utils/jwt';
import { encrypt, decrypt, hashEmail } from '../../shared/utils/encryption';
import { AppError } from '../../shared/errors/app-error';
import type { RegisterInput, LoginInput, RefreshTokenInput } from './auth.schema';

export class AuthService {
  /**
   * Registers a new user, encrypts their email, generates a blind index, hashes their password, and issues tokens.
   */
  static async register(input: RegisterInput) {
    const emailLower = input.email.toLowerCase().trim();
    const emailHash = hashEmail(emailLower);

    // 1. Check if user already exists using the blind index
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.emailHash, emailHash))
      .limit(1);

    if (existingUser) {
      throw new AppError(409, 'Email is already registered');
    }

    // 2. Hash password
    const passwordHash = await PasswordService.hash(input.password);

    // 3. Encrypt email for secure storage at rest
    const encryptedEmail = encrypt(emailLower);

    // 4. Insert user into database with encrypted email and blind index
    const [newUser] = await db
      .insert(users)
      .values({
        name: input.name,
        email: encryptedEmail,
        emailHash,
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

    // 5. Generate tokens for immediate authentication after registration
    const tokenPayload = { userId: newUser.id, email: emailLower, role: newUser.role };
    const accessToken = JwtService.generateAccessToken(tokenPayload);
    const refreshToken = JwtService.generateRefreshToken(tokenPayload);

    // 6. Save refresh token in database
    await db
      .update(users)
      .set({ refreshToken })
      .where(eq(users.id, newUser.id));

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: emailLower,
        role: newUser.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  /**
   * Authenticates user via blind index, verifies password, decrypts email, and issues tokens.
   */
  static async login(input: LoginInput) {
    const emailLower = input.email.toLowerCase().trim();
    const emailHash = hashEmail(emailLower);

    // 1. Find user by email blind index
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.emailHash, emailHash))
      .limit(1);

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    // 2. Verify password
    const isValidPassword = await PasswordService.verify(user.passwordHash, input.password);

    if (!isValidPassword) {
      throw new AppError(401, 'Invalid email or password');
    }

    // 3. Decrypt email for token payload and response
    const decryptedEmail = decrypt(user.email);

    // 4. Generate tokens
    const tokenPayload = { userId: user.id, email: decryptedEmail, role: user.role };
    const accessToken = JwtService.generateAccessToken(tokenPayload);
    const refreshToken = JwtService.generateRefreshToken(tokenPayload);

    // 5. Save refresh token in database
    await db
      .update(users)
      .set({ refreshToken })
      .where(eq(users.id, user.id));

    return {
      user: {
        id: user.id,
        name: user.name,
        email: decryptedEmail,
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
      throw new AppError(401, 'Invalid or expired refresh token');
    }

    // Check if refresh token matches the database record
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user || user.refreshToken !== input.refreshToken) {
      throw new AppError(401, 'Invalid refresh token');
    }

    const decryptedEmail = decrypt(user.email);

    // Issue new tokens
    const tokenPayload = { userId: user.id, email: decryptedEmail, role: user.role };
    const newAccessToken = JwtService.generateAccessToken(tokenPayload);
    const newRefreshToken = JwtService.generateRefreshToken(tokenPayload);

    // Update database with new refresh token
    await db
      .update(users)
      .set({ refreshToken: newRefreshToken })
      .where(eq(users.id, user.id));

    return {
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
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
