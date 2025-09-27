import { createHmac } from 'node:crypto';

/**
 * Creates entropy input as HMAC(serverSeed, `${clientSeed}:${nonce}`).
 *
 * @param {string} serverSeed - HMAC key.
 * @param {string} clientSeed - Client seed.
 * @param {number} nonce - Monotonic nonce.
 * @param {string} [algorithm='sha256'] - Hash algorithm.
 * @returns {Buffer} HMAC digest.
 */
export function createEntropyInput(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  algorithm: string = 'sha256',
): Buffer {
  const hmac = createHmac(algorithm, serverSeed);

  hmac.update(`${clientSeed}:${nonce}`);

  return hmac.digest();
}
