import { inject, injectable } from "inversify";
import { Logger, TransactionCtx } from "~/common/interface";
import { IMessageSender } from "./IMessageSender";
import { IMessageServiceInitializer } from "./IMessageServiceInitializer";
import {
  IMessageServiceTransportType,
  IMessageServiceTransport
} from "./IMessageServiceTransport";
import { Message } from "./Message";

@injectable()
export class MessageSender implements IMessageServiceInitializer, IMessageSender {
  private initialized = false;

  constructor(
    @inject(Logger) private logger: Logger,
    @inject(IMessageServiceTransportType) private transport: IMessageServiceTransport
  ) {}

  async init() {
    try {
      await this.transport.initReceiver();
      this.initialized = true;
    } catch (e) {
      this.logger.error(this, e);
      console.error(e);
    }
  }

  send<T extends Record<string, unknown>>(message: Message, trx?: TransactionCtx) {
    this.logger.info(this, `sending ${message.$name}`, message);

    return trx
      ? Promise.resolve(trx.queueMessage(message))
      : this.transport.sendMessage(message);
  }
}
