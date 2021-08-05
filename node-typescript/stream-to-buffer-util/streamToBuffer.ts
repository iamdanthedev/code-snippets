import { Readable } from "stream";
import ReadStream = NodeJS.ReadStream;

type Options = {
  maxLength: number; // ~5mb
};

/**
 * Reads stream into a buffer
 * Inspired by https://github.com/stream-utils/stream-to-array/blob/master/index.js
 */
export function streamToBuffer(
  stream: ReadStream | Readable,
  options: Options = {
    maxLength: 5_000_000_000
  }
): Promise<Buffer> {
  if (!stream.readable) {
    throw new Error("stream has ended");
  }

  return new Promise((resolve, reject) => {
    const arr = [];

    stream.on("data", onData);
    stream.on("end", onEnd);
    stream.on("error", onEnd);
    stream.on("close", onClose);

    function onData(doc) {
      arr.push(doc);

      if (arr.length > options.maxLength) {
        reject(new Error(`stream length exceed max size of ${options.maxLength} bytes`));
        cleanup();
      }
    }

    function onEnd(err) {
      if (err) {
        reject(err);
      } else {
        resolve(Buffer.concat(arr));
      }

      cleanup();
    }

    function onClose() {
      resolve(Buffer.concat(arr));
      cleanup();
    }

    function cleanup() {
      stream.removeListener("data", onData);
      stream.removeListener("end", onEnd);
      stream.removeListener("error", onEnd);
      stream.removeListener("close", onClose);
    }
  });
}
