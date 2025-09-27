import { createWriteStream } from 'node:fs';
import { resolve } from 'node:path';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { HmacDrbg, createEntropyInput, generateRandomDraws, generateServerSeed } from '../src';

import { writeLineToStream } from './write-line-to-stream';

const options = yargs(hideBin(process.argv))
  .options({
    'client-seed': {
      type: 'string',
      demandOption: true,
      description: 'Client seed for RNG generation',
    },
    'server-seed': {
      type: 'string',
      demandOption: false,
      description: 'Server seed for RNG generation',
    },
    'range-start': {
      type: 'number',
      demandOption: true,
      description: 'Start of the number range',
    },
    'range-end': {
      type: 'number',
      demandOption: true,
      description: 'End of the number range',
    },
    selections: {
      type: 'number',
      demandOption: true,
      description: 'Number of numbers to select',
    },
    draws: {
      type: 'number',
      demandOption: true,
      description: 'Number of draws to perform',
    },
    'with-replacements': {
      type: 'boolean',
      default: false,
      description: 'Allow number repetitions in selection',
    },
    destination: {
      type: 'string',
      demandOption: true,
      description: 'Output file path',
    },
  })
  .parseSync();

async function main() {
  const totalDraws = options.draws;
  const batchSize = 100_000;
  let completedDraws = 0;

  const rngOptions = {
    serverSeed: options.serverSeed || generateServerSeed(),
    clientSeed: options.clientSeed,
    nonce: 0,
  };

  const hmacDrbg = new HmacDrbg(
    'sha256',
    createEntropyInput(rngOptions.serverSeed, rngOptions.clientSeed, rngOptions.nonce),
  );

  const outputPath = resolve(options.destination);
  process.stdout.write(`Generate output to: ${outputPath}\n`);
  const outputStream = createWriteStream(outputPath);
  process.stdout.write(`Batch size: ${batchSize}\n`);

  for (let batchStart = 0; batchStart < totalDraws; batchStart += batchSize) {
    const batchEnd = Math.min(batchStart + batchSize, totalDraws);
    const currentBatchSize = batchEnd - batchStart;

    const drawsBatch = generateRandomDraws(
      hmacDrbg,
      options.rangeStart,
      options.rangeEnd,
      options.selections,
      currentBatchSize,
      options.withReplacements,
    );

    for (const draw of drawsBatch) {
      await writeLineToStream(outputStream, `${draw.join(' ')}\n`);
    }

    completedDraws += currentBatchSize;
    const percent = ((completedDraws / totalDraws) * 100).toFixed(2);
    process.stdout.write(`\rProgress: ${percent}% (${completedDraws}/${totalDraws})`);
  }

  process.stdout.write(`\rProgress: 100.00% (${totalDraws}/${totalDraws})\n`);
  await new Promise((resolve) => outputStream.end(resolve));
  process.stdout.write('Generation completed successfully!\n');
}

main().catch((err) => {
  console.error('\nError:', err);
  process.exit(1);
});
