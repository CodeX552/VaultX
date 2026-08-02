import crypto from 'crypto';
import { env } from '../config/env';

// AES-256-GCM algorithm with env-based key for vault passwords.
const algorithm = 'aes-256-gcm';
const key = Buffer.from(env.ENCRYPTION_KEY, 'hex');

export function encryptVaultPassword(password: string) {
  // Har password ke liye random IV generate hota hai.
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  const encrypted = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedPassword: encrypted.toString('base64'),
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

export function decryptVaultPassword(payload: { encryptedPassword: string; iv: string; authTag: string }) {
  // Decryption me same IV aur auth tag use hote hain.
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(payload.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(payload.authTag, 'hex'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.encryptedPassword, 'base64')),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
}
