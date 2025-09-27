import { HmacDrbg, createEntropyInput, generateRandomDraws, generateServerSeed } from '../src';

interface RNGOptions {
  serverSeed: string;
  clientSeed: string;
  nonce: number;
}

interface KenoOptions {
  numbersToPick: number;
  totalNumbers: number;
}

function generateKenoNumbers(rngOptions: RNGOptions, kenoOptions: KenoOptions) {
  const entropy = createEntropyInput(
    rngOptions.serverSeed,
    rngOptions.clientSeed,
    rngOptions.nonce,
  );

  const rng = new HmacDrbg('sha256', entropy);

  return generateRandomDraws(rng, 1, kenoOptions.totalNumbers, kenoOptions.numbersToPick, 1, false);
}

const rngOptions: RNGOptions = {
  serverSeed: generateServerSeed(),
  clientSeed: '1234567890',
  nonce: 0,
};

const kenoOptions: KenoOptions = {
  numbersToPick: 20,
  totalNumbers: 80,
};

const kenoNumbers = generateKenoNumbers(rngOptions, kenoOptions);

console.log('Keno numbers:', kenoNumbers);
