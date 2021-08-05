import { injectable } from "inversify";
import { OnMessageCallback, IMessageServiceTransport } from "../IMessageServiceTransport";
import { Message } from "../Message";

@injectable()
export class MemoryTransport implements IMessageServiceTransport {
  private onMessageCallback: OnMessageCallback = null;

  initReceiver(): Promise<any> {
    return Promise.resolve();
  }

  initSubscriber(): Promise<any> {
    return Promise.resolve();
  }

  onMessage(cb: OnMessageCallback): void {
    this.onMessageCallback = cb;
  }

  sendMessage(message: Message): Promise<any> {
    if (!this.onMessageCallback) {
      throw new Error("Received a message but missing onMessageCallback");
    }

    const data = JSON.parse(message.serialize());

    return Promise.resolve(this.onMessageCallback(data.name, data.body, message));
  }
}
