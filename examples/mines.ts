import { HmacDrbg, createEntropyInput, generateRandomDraws, generateServerSeed } from '../src';

interface RNGOptions {
  serverSeed: string;
  clientSeed: string;
  nonce: number;
}

interface MinesOptions {
  tilesCount: number;
  minesCount: number;
}

function generateMinesPositions(rngOptions: RNGOptions, minesOptions: MinesOptions) {
  const entropy = createEntropyInput(
    rngOptions.serverSeed,
    rngOptions.clientSeed,
    rngOptions.nonce,
  );

  const rng = new HmacDrbg('sha256', entropy);

  return generateRandomDraws(rng, 1, minesOptions.tilesCount, minesOptions.minesCount, 1, false)[0];
}

const rngOptions: RNGOptions = {
  serverSeed: generateServerSeed(),
  clientSeed: '1234567890',
  nonce: 0,
};

const minesOptions: MinesOptions = {
  tilesCount: 25,
  minesCount: 24,
};

const minesPositions = generateMinesPositions(rngOptions, minesOptions);

console.log('Mines positions:', minesPositions);
