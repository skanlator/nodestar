import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nodestar_default_secret_key';

export interface JwtPayload {
  userId: string;
  email: string;
  role?: string;
}

export class JwtService {
  /**
   * Generates an access token (instance method)
   */
  public generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
  }

  /**
   * Generates a refresh token (instance method)
   */
  public generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  }

  /**
   * Verifies and decodes a token (instance method)
   */
  public verifyToken(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  }

  // --- Static fallback methods for compatibility ---

  public static generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
  }

  public static generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  }

  public static verifyToken(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  }
}
