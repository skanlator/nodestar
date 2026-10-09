import argon2 from 'argon2';

export class PasswordService {
  /**
   * Hashes a plain text password using Argon2id.
   */
  static async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
    });
  }

  /**
   * Verifies a plain text password against an existing hash.
   */
  static async verify(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }
}
