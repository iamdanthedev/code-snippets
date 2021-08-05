import { inject, injectable } from "inversify";
import * as ServiceBus from "@azure/service-bus";
import { isPromise } from "~/common";
import { Logger } from "~/common/interface";
import { IMessageServiceTransport, OnMessageCallback } from "../IMessageServiceTransport";
import { Message } from "../Message";

export type BusEvent = {
  name: string;
  body: any;
};

export interface IAzureTransportOptions {
  connString: string;
  topic: string;
  sub: string;
}

export const IAzureTransportOptionsType = Symbol("IAzureTransportOptionsType");

@injectable()
export class AzureTransport implements IMessageServiceTransport {
  private sbClient: ServiceBus.ServiceBusClient;
  private subscriptionClient: ServiceBus.SubscriptionClient;
  private topicClient: ServiceBus.TopicClient;
  private topicSender: ServiceBus.Sender;

  private onMessageCallback: OnMessageCallback = null;

  constructor(
    @inject(Logger) private logger: Logger,
    @inject(IAzureTransportOptionsType) private options: IAzureTransportOptions // @inject(IAzureAuthType) private azureAuth: IAzureAuth
  ) {
    this.createClient();
  }

  createClient() {
    this.sbClient = ServiceBus.ServiceBusClient.createFromConnectionString(
      this.options.connString
    );

    this.topicClient = this.sbClient.createTopicClient(this.options.topic);
    this.topicSender = this.topicClient.createSender();

    this.subscriptionClient = this.sbClient.createSubscriptionClient(
      this.options.topic,
      this.options.sub
    );
  }

  async initSubscriber() {
    this._subscribe();
  }

  async initReceiver() {
    return Promise.resolve();
  }

  onMessage(cb: OnMessageCallback): void {
    this.onMessageCallback = cb;
  }

  async sendMessage(message: Message, attempt = 1): Promise<void> {
    const body = message.getEnvelope();

    try {
      await this.topicSender.send({
        body,
        label: message.$name,
        userProperties: {
          Name: message.$name
        }
      });
    } catch (err) {
      this.logger.error(this, err, { message });

      if (attempt <= 5) {
        this.logger.info(
          this,
          `trying to recreate topic client and retry. attempt ${attempt}`
        );
        this.createClient();
        return this.sendMessage(message, attempt + 1);
      }

      // all attempts exhausted
      this.logger.error(this, new Error("sendMessage: exhausted all attempts"));
      throw err;
    }
  }

  private _subscribe() {
    const receiver = this.subscriptionClient.createReceiver(
      ServiceBus.ReceiveMode.peekLock
    );

    const messageHandler: ServiceBus.OnMessage = async message => {
      const msg: BusEvent =
        typeof message.body === "string" ? JSON.parse(message.body) : message.body;
      const result = this.onMessageCallback(msg.name, msg.body, message.body);

      if (isPromise(result)) {
        await result;
      }

      await message.complete();
    };

    const errorHandler: ServiceBus.OnError = err => {
      console.error(err);
    };

    receiver.registerMessageHandler(messageHandler, errorHandler, {
      autoComplete: false
    });
  }
}
