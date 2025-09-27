import { randomBytes } from 'node:crypto';

/**
 * Generates a 32-byte cryptographically secure server seed (hex).
 *
 * @returns {string} 64-character hex string.
 */
export function generateServerSeed(): string {
  return randomBytes(32).toString('hex');
}
