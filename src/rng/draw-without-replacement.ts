import { HmacDrbg } from '../hmac-drbg';

import { generateUniformUint32 } from './generate-uniform-uint-32';

/**
 * Picks `selection` unique integers from the inclusive range [min, max]
 * using a partial Fisher–Yates shuffle (unbiased). Returns them in random order.
 *
 * @param {HmacDrbg} drbg - Cryptographically secure generator (HMAC-DRBG).
 * @param {number} min - Lower bound, inclusive.
 * @param {number} max - Upper bound, inclusive.
 * @param {number} selection - How many values to pick.
 * @returns {number[]} Array of `selection` distinct integers from the range.
 * @throws {RangeError} If `selection` is out of range.
 */
export function drawWithoutReplacement(
  drbg: HmacDrbg,
  min: number,
  max: number,
  selection: number,
): number[] {
  const size = max - min + 1;
  if (selection < 0 || selection > size) {
    throw new RangeError('Range too small for desired selection size');
  }

  const a = Array.from({ length: size }, (_, k) => min + k);

  for (let i = 0; i < selection; i++) {
    const j = i + generateUniformUint32(drbg, 0, size - i - 1);
    [a[i], a[j]] = [a[j], a[i]];
  }

  return a.slice(0, selection);
}
