import { injectable, inject } from "inversify";
import {
  IMessageHandlerFactory,
  IMessageHandlerFactoryType
} from "./IMessageHandlerFactory";
import { IMessageServiceInitializer } from "./IMessageServiceInitializer";
import {
  IMessageServiceTransport,
  IMessageServiceTransportType,
} from "./IMessageServiceTransport";
import { Logger } from "~/common/interface";

@injectable()
export class MessageSubscriber implements IMessageServiceInitializer {
  private initialized = false;

  constructor(
    @inject(Logger) private logger: Logger,
    @inject(IMessageServiceTransportType) private transport: IMessageServiceTransport,
    @inject(IMessageHandlerFactoryType)
    private messageHandlerFactory: IMessageHandlerFactory
  ) {
    this.transport.onMessage(this._handle.bind(this));
  }

  async init() {
    try {
      await this.transport.initSubscriber();
      this.initialized = true;
    } catch (e) {
      this.logger.error(this, e);
      console.error(e);
    }
  }

  private _handle(name: string, body: any, message: any): Promise<any> {
    this.logger.info(this, `processing "${name}"`, { body });

    const handler = this.messageHandlerFactory.getHandler(name, body);

    if (!handler) {
      this.logNoHandlerFound(name, body);
      return;
    }

    return handler
      .handle()
      .then(result => this.logSuccess(name, body, result))
      .catch(e => this.logError(name, body, e));
  }

  private logNoHandlerFound(name: string, body: any) {
    this.logger.info(this, "Message handler not found", {
      messageName: name,
      messageBody: body
    });
  }

  private logSuccess(name: string, body: any, result: any) {
    this.logger.info(this, "Message handled", {
      messageName: name,
      messageBody: body,
      result
    });
  }

  private logError(name: string, body: string, e?: Error) {
    e = e ? e : new Error(`cannot process message "${name}"`);

    console.error(e);
    this.logger.error(this, e, {
      name,
      body: JSON.stringify(body, null, 4)
    });
  }
}
