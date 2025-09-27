import { createWriteStream } from 'node:fs';
import { resolve } from 'node:path';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { HmacDrbg, createEntropyInput, generateServerSeed } from '../src';

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
    count: {
      type: 'number',
      demandOption: true,
      description: 'Number of uint32 values to generate',
    },
    destination: {
      type: 'string',
      demandOption: true,
      description: 'Output file path',
    },
  })
  .parseSync();

async function main() {
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
  process.stdout.write(`Generating output to: ${outputPath}\n`);
  const outputStream = createWriteStream(outputPath);

  const dieharderFileHeader = `#==================================================================
# HMAC_DRBG
#==================================================================
type: d
count: ${options.count}
numbit: 32
`;

  outputStream.write(dieharderFileHeader);

  for (let i = 0; i < options.count; i++) {
    const num = hmacDrbg.generate(4).readUInt32LE(0);
    const numFormatted = num.toString().padStart(10, ' ');

    await writeLineToStream(outputStream, `${numFormatted}\n`);

    if (i % 100_000 === 0) {
      const percent = ((i / options.count) * 100).toFixed(2);
      process.stdout.write(`\rProgress: ${percent}% (${i}/${options.count})`);
    }
  }

  await new Promise((resolve) => outputStream.end(resolve));

  process.stdout.write(`\rProgress: 100.00% (${options.count}/${options.count})\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
