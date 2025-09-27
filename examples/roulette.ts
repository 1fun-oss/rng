import { HmacDrbg, createEntropyInput, generateRandomDraws, generateServerSeed } from '../src';

interface RNGOptions {
  serverSeed: string;
  clientSeed: string;
  nonce: number;
}

interface RouletteOptions {
  min: number;
  max: number;
}

function generateRouletteNumber(rngOptions: RNGOptions, rouletteOptions: RouletteOptions) {
  const entropy = createEntropyInput(
    rngOptions.serverSeed,
    rngOptions.clientSeed,
    rngOptions.nonce,
  );

  const rng = new HmacDrbg('sha256', entropy);

  return generateRandomDraws(rng, rouletteOptions.min, rouletteOptions.max, 1, 1, true)[0][0];
}

const EUROPEAN_ROULETTE: RouletteOptions = { min: 0, max: 36 };
const AMERICAN_ROULETTE: RouletteOptions = { min: 0, max: 37 };

const rngOptions: RNGOptions = {
  serverSeed: generateServerSeed(),
  clientSeed: '1234567890',
  nonce: 0,
};

const europeanResult = generateRouletteNumber(rngOptions, EUROPEAN_ROULETTE);
console.log('European Roulette number:', europeanResult);

const americanResult = generateRouletteNumber(rngOptions, AMERICAN_ROULETTE);
const americanNumber = americanResult === 37 ? '00' : americanResult;
console.log('American Roulette number:', americanNumber);
