import { WriteStream } from 'node:fs';

export function writeLineToStream(
  stream: WriteStream,
  text: string,
  encoding: BufferEncoding = 'ascii',
): Promise<void> {
  return new Promise((resolve) => {
    if (!stream.write(text, encoding)) {
      stream.once('drain', resolve);
    } else {
      resolve();
    }
  });
}
