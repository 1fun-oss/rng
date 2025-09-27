import { HmacDrbg, createEntropyInput, generateRandomDraws, generateServerSeed } from '../src';

interface RNGOptions {
  serverSeed: string;
  clientSeed: string;
  nonce: number;
}

interface TowerOptions {
  rows: number;
  cellsPerRow: number;
  minesPerRow: number;
}

function generateTowerMinesPositions(rngOptions: RNGOptions, towerOptions: TowerOptions) {
  const entropy = createEntropyInput(
    rngOptions.serverSeed,
    rngOptions.clientSeed,
    rngOptions.nonce,
  );

  const rng = new HmacDrbg('sha256', entropy);

  return generateRandomDraws(
    rng,
    1,
    towerOptions.cellsPerRow,
    towerOptions.minesPerRow,
    towerOptions.rows,
    false,
  );
}

const rngOptions: RNGOptions = {
  serverSeed: generateServerSeed(),
  clientSeed: '1234567890',
  nonce: 0,
};

const towerOptions: TowerOptions = {
  rows: 10,
  cellsPerRow: 5,
  minesPerRow: 3,
};

const towerMines = generateTowerMinesPositions(rngOptions, towerOptions);

console.log('Tower mines positions:');
towerMines.forEach((minePosition, rowIndex) => {
  console.log(`[row ${rowIndex}]: ${minePosition.join(', ')}`);
});
