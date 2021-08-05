import { Readable } from "stream";

interface AggregationStreamOptions {
  getStream: () => Readable | null;
}

export class AggregationStream extends Readable {
  finished = false;

  private activeStream: Readable;

  constructor(private options: AggregationStreamOptions) {
    super({ objectMode: true });
    this.newIncomingStream();
  }

  _read() {
    if (this.finished) {
      return;
    }
  }

  newIncomingStream() {
    this.activeStream = this.options.getStream();

    if (!this.activeStream) {
      this.finished = true;
      this.destroy();
      return;
    }

    this.activeStream.on("data", chunk => {
      this.push(chunk);
    });

    this.activeStream.on("finish", () => {
      this.newIncomingStream();
    });

    this.activeStream.on("error", err => {
      this.destroy(err);
    });
  }
}
