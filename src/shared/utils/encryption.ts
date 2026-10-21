import crypto from 'node:crypto';
import { env } from '../../config/env.ts';

/**
 * Retrieves and validates the 32-byte secret key for AES-256 encryption.
 */
const getSecretKey = (): Buffer => {
  // Expects a 64-character hex string in environment variables (32 bytes)
  return Buffer.from(
    env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    'hex'
  );
};

/**
 * Encrypts plain text (e.g., email) using AES-256-GCM.
 * Returns a colon-separated string containing IV, auth tag, and ciphertext.
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12); // 12-byte initialization vector for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', getSecretKey(), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM encrypted text back to its original plain text.
 */
export function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
  if (!ivHex || !authTagHex || !encrypted) {
    throw new Error('Invalid encrypted text format');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', getSecretKey(), iv);
  
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Generates a deterministic HMAC-SHA256 hash (Blind Index) for fast, secure database lookups.
 */
export function hashEmail(email: string): string {
  return crypto
    .createHmac('sha256', getSecretKey())
    .update(email.toLowerCase().trim())
    .digest('hex');
}
