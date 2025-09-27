/**
 * TypeScript HMAC-DRBG implementation.
 *
 * Copyright (c) 2025, 1fun provider ltd
 *
 * Based on code from:
 *   - bcrypto (Christopher Jeffrey, MIT License)
 *     https://github.com/bcoin-org/bcrypto/blob/master/lib/js/hmac-drbg.js
 *   - hmac-drbg (Fedor Indutny, MIT License)
 *     https://github.com/indutny/hmac-drbg
 */

import { createHmac } from 'node:crypto';

/*
 * Constants
 */

const RESEED_INTERVAL = 0x1000000000000;

export type HashAlgorithm =
  | 'sha1'
  | 'sha224'
  | 'sha256'
  | 'sha384'
  | 'sha512'
  | 'sha3-224'
  | 'sha3-256'
  | 'sha3-384'
  | 'sha3-512';

const HASH_LENGTHS: Record<HashAlgorithm, number> = {
  sha1: 20,
  sha224: 28,
  sha256: 32,
  sha384: 48,
  sha512: 64,
  'sha3-224': 28,
  'sha3-256': 32,
  'sha3-384': 48,
  'sha3-512': 64,
};

const MIN_ENTROPY: Record<HashAlgorithm, number> = {
  sha1: 10,
  sha224: 14,
  sha256: 16,
  sha384: 24,
  sha512: 32,
  'sha3-224': 14,
  'sha3-256': 16,
  'sha3-384': 24,
  'sha3-512': 32,
};

export class HmacDrbg {
  private k: Buffer;
  private v: Buffer;
  private readonly hashLen: number;
  private readonly minEntropy: number;
  private rounds: number = 0;

  constructor(
    private readonly algorithm: HashAlgorithm = 'sha256',
    entropy?: Buffer,
    nonce?: Buffer,
    personalization?: Buffer,
  ) {
    this.hashLen = HASH_LENGTHS[algorithm];
    this.minEntropy = MIN_ENTROPY[algorithm];
    this.k = Buffer.alloc(this.hashLen, 0x00);
    this.v = Buffer.alloc(this.hashLen, 0x01);

    if (entropy) {
      this.instantiate(entropy, nonce, personalization);
    }
  }

  private hmac(key: Buffer, data: Buffer): Buffer {
    return createHmac(this.algorithm, key).update(data).digest();
  }

  private update(providedData?: Buffer): void {
    const data = providedData || Buffer.alloc(0);

    // K = HMAC(K, V || 0x00 || provided_data)
    this.k = this.hmac(this.k, Buffer.concat([this.v, Buffer.from([0x00]), data]));
    // V = HMAC(K, V)
    this.v = this.hmac(this.k, this.v);

    if (data.length > 0) {
      // K = HMAC(K, V || 0x01 || provided_data)
      this.k = this.hmac(this.k, Buffer.concat([this.v, Buffer.from([0x01]), data]));
      // V = HMAC(K, V)
      this.v = this.hmac(this.k, this.v);
    }
  }

  instantiate(entropy: Buffer, nonce?: Buffer, personalization?: Buffer): void {
    if (!Buffer.isBuffer(entropy)) {
      throw new TypeError('Entropy must be a Buffer');
    }

    const seedMaterial = Buffer.concat([
      entropy,
      nonce || Buffer.alloc(0),
      personalization || Buffer.alloc(0),
    ]);

    if (seedMaterial.length < this.minEntropy) {
      throw new Error('Not enough entropy.');
    }

    // Reset state
    this.k.fill(0x00);
    this.v.fill(0x01);

    this.update(seedMaterial);
    this.rounds = 1;
  }

  reseed(entropy: Buffer, additionalInput?: Buffer): void {
    if (!Buffer.isBuffer(entropy)) {
      throw new TypeError('Entropy must be a Buffer');
    }

    if (this.rounds === 0) {
      throw new Error('DRBG not initialized.');
    }

    const seedMaterial = Buffer.concat([entropy, additionalInput || Buffer.alloc(0)]);

    if (seedMaterial.length < this.minEntropy) {
      throw new Error('Not enough entropy.');
    }

    this.update(seedMaterial);
    this.rounds = 1;
  }

  generate(bytesRequested: number, additionalInput?: Buffer): Buffer {
    if (this.rounds === 0) {
      throw new Error('DRBG not initialized.');
    }

    if (this.rounds > RESEED_INTERVAL) {
      throw new Error('Reseed is required.');
    }

    if (additionalInput?.length) {
      this.update(additionalInput);
    }

    const result = Buffer.alloc(bytesRequested);
    let offset = 0;

    while (offset < bytesRequested) {
      this.v = this.hmac(this.k, this.v);
      const copyLen = Math.min(this.hashLen, bytesRequested - offset);
      this.v.copy(result, offset, 0, copyLen);
      offset += copyLen;
    }

    this.update(additionalInput);
    this.rounds += 1;

    return result;
  }
}
