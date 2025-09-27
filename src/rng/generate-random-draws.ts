import { HmacDrbg } from '../hmac-drbg';

import { drawWithReplacement } from './draw-with-replacement';
import { drawWithoutReplacement } from './draw-without-replacement';

export type RandomDraws = number[][];

/**
 * Generates multiple random draws of integers within a given inclusive range.
 *
 * Each draw is either sampled with replacement (values can repeat within a draw),
 * or without replacement (values are unique within a draw, using Fisher–Yates shuffle).
 *
 * @param {HmacDrbg} drbg - Cryptographically secure generator (HMAC-DRBG).
 * @param {number} min - Lower bound of the range (inclusive).
 * @param {number} max - Upper bound of the range (inclusive).
 * @param {number} [selections=1] - Number of values to select per draw.
 * @param {number} [draws=1] - Number of independent draws to generate.
 * @param {boolean} [withReplacements=false] - Whether to allow repeated values within a draw.
 *   - `true`: Each selection is independent, values may repeat.
 *   - `false`: Each selection is unique within a draw (Fisher–Yates sampling).
 * @returns {RandomDraws} A 2D array of shape [draws][selections],
 *   where each sub-array contains one draw of random integers.
 */
export function generateRandomDraws(
  drbg: HmacDrbg,
  min: number,
  max: number,
  selections: number = 1,
  draws: number = 1,
  withReplacements: boolean = false,
): RandomDraws {
  const result: RandomDraws = new Array(draws);

  for (let i = 0; i < draws; i++) {
    if (withReplacements) {
      result[i] = drawWithReplacement(drbg, min, max, selections);
      continue;
    }

    result[i] = drawWithoutReplacement(drbg, min, max, selections);
  }

  return result;
}
