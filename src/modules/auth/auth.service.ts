import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.ts';
import { AppError } from '../../shared/errors/app-error.ts';
import { RegisterDTO, LoginDTO } from './auth.schema.ts';
import { AuthResponse, UserPayload } from './auth.types.ts';

// In-memory user store for boilerplate testing (ready to replace with ORM/DB)
const usersDb = new Map<string, { id: string; email: string; name?: string; passwordHash: string }>();

export class AuthService {
  static async register(dto: RegisterDTO): Promise<AuthResponse> {
    const existingUser = Array.from(usersDb.values()).find((user) => user.email === dto.email);
    if (existingUser) {
      throw new AppError(400, 'User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const newUser = {
      id: crypto.randomUUID(),
      email: dto.email,
      name: dto.name,
      passwordHash,
    };

    usersDb.set(newUser.id, newUser);

    const userPayload: UserPayload = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    };

    const token = this.generateToken(userPayload);

    return { user: userPayload, token };
  }

  static async login(dto: LoginDTO): Promise<AuthResponse> {
    const user = Array.from(usersDb.values()).find((u) => u.email === dto.email);
    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    const userPayload: UserPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    const token = this.generateToken(userPayload);

    return { user: userPayload, token };
  }

  private static generateToken(payload: UserPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }
}
