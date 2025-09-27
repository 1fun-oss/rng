import { HmacDrbg } from '../hmac-drbg';

/**
 * Returns a uniformly distributed integer in the inclusive range [min, max]
 * using rejection sampling (no modulo bias).
 *
 * @param {HmacDrbg} drbg - Cryptographically secure generator (HMAC-DRBG).
 * @param {number} [min=0] - Lower bound (0..4294967295), inclusive.
 * @param {number} [max=0xFFFFFFFF] - Upper bound (>= min), inclusive.
 * @returns {number} A random UInt32 in [min, max].
 * @throws {RangeError} If bounds are not safe integers, out of UInt32 range, or min > max.
 */
export function generateUniformUint32(
  drbg: HmacDrbg,
  min: number = 0,
  max: number = 0xffffffff,
): number {
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max)) {
    throw new RangeError('min/max must be safe integers');
  }

  if (min < 0 || max > 0xffffffff || min > max) {
    throw new RangeError('UInt32 range should be in 0..4294967295 and min <= max');
  }

  const range = max - min + 1;
  if (range === 1) {
    return min;
  }

  const SPACE = 0x1_0000_0000; // 2^32
  const THRESHOLD = SPACE - (SPACE % range);

  while (true) {
    const value = drbg.generate(4).readUInt32LE(0); // 0..2^32-1
    if (value < THRESHOLD) {
      return min + (value % range);
    }
  }
}
