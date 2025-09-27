import { createWriteStream } from 'node:fs';
import { resolve } from 'node:path';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { HmacDrbg, createEntropyInput, generateServerSeed } from '../src';

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

  const CHUNK_SIZE = 1_000_000; // uint32 per chunk

  let remaining = options.count;
  let generated = 0;

  while (remaining > 0) {
    const toGenerate = Math.min(CHUNK_SIZE, remaining);

    const bytes = toGenerate * 4;
    const buf = hmacDrbg.generate(bytes);

    if (!outputStream.write(buf)) {
      await new Promise<void>((resolve) => outputStream.once('drain', resolve));
    }

    remaining -= toGenerate;
    generated += toGenerate;

    const percent = ((generated / options.count) * 100).toFixed(2);
    process.stdout.write(`\rProgress: ${percent}% (${generated}/${options.count})`);
  }

  await new Promise((resolve) => outputStream.end(resolve));

  process.stdout.write(`\rProgress: 100.00% (${options.count}/${options.count})\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
