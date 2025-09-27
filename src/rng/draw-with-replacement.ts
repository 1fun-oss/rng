import { HmacDrbg } from '../hmac-drbg';

import { generateUniformUint32 } from './generate-uniform-uint-32';

/**
 * Draws a sequence of random integers from the inclusive range [min, max],
 * allowing repeated values.
 *
 * @param {HmacDrbg} drbg - Cryptographically secure generator (HMAC-DRBG).
 * @param {number} min - Lower bound, inclusive.
 * @param {number} max - Upper bound, inclusive.
 * @param {number} selection - How many values to pick.
 * @returns {number[]} An array of random integers of length `selections`,
 *                     where values may repeat.
 */
export function drawWithReplacement(
  drbg: HmacDrbg,
  min: number,
  max: number,
  selection: number,
): number[] {
  const draw = new Array<number>(selection);

  for (let i = 0; i < selection; i++) {
    draw[i] = generateUniformUint32(drbg, min, max);
  }

  return draw;
}
