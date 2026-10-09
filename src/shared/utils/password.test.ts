import { describe, it, expect } from 'vitest';
import { PasswordService } from './password.ts';

describe('PasswordService', () => {
  const plainPassword = 'SuperSecretPassword123!';

  it('should hash a password and return a valid Argon2 string', async () => {
    const hash = await PasswordService.hash(plainPassword);

    expect(hash).toBeDefined();
    expect(hash.startsWith('$argon2id$')).toBe(true);
  });

  it('should return true when verifying correct password', async () => {
    const hash = await PasswordService.hash(plainPassword);
    const isValid = await PasswordService.verify(hash, plainPassword);

    expect(isValid).toBe(true);
  });

  it('should return false when verifying incorrect password', async () => {
    const hash = await PasswordService.hash(plainPassword);
    const isValid = await PasswordService.verify(hash, 'WrongPassword123!');

    expect(isValid).toBe(false);
  });
});
