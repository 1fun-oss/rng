import { HmacDrbg, createEntropyInput, generateRandomDraws, generateServerSeed } from '../src';

interface RNGOptions {
  serverSeed: string;
  clientSeed: string;
  nonce: number;
}

interface DiceOptions {
  totalOutcomes: number;
}

function generateDiceNumber(rngOptions: RNGOptions, diceOptions: DiceOptions) {
  const entropy = createEntropyInput(
    rngOptions.serverSeed,
    rngOptions.clientSeed,
    rngOptions.nonce,
  );

  const rng = new HmacDrbg('sha256', entropy);

  return generateRandomDraws(rng, 1, diceOptions.totalOutcomes, 1, 1, false)[0][0];
}

const rngOptions: RNGOptions = {
  serverSeed: generateServerSeed(),
  clientSeed: '1234567890',
  nonce: 0,
};

const diceOptions: DiceOptions = {
  totalOutcomes: 6,
};

const diceNumber = generateDiceNumber(rngOptions, diceOptions);

console.log('Dice number:', diceNumber);
