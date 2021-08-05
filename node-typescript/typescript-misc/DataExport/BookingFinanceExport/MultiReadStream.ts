import { Readable, Transform } from "stream";

interface MultiReadStreamOptions {
  getStream: () => Readable | null;
}

export class MultiReadStream extends Transform {
  queue: any[] = [];
  private activeStream: Readable;

  constructor(private options: MultiReadStreamOptions) {
    super({ objectMode: true });
    this.activeStream = options.getStream();
    this.setHandlers();
  }

  _read(size: number): void {
    const slice = this.queue.splice(0, size);

    if (slice.length < size) {
      this.activeStream = this.options.getStream();
      this.setHandlers();
    }

    this.push(slice);
  }

  _write(data) {
    this.queue.push(data);
  }

  private setHandlers() {
    this.activeStream.pipe(this);

    this.activeStream.on("finish", () => {
      this.activeStream = this.options.getStream();
      this.setHandlers();
    });
  }
}
