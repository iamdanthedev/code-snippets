import { IMessage } from "~/common/interface";
import { IMessageSender } from "~/Service";

export class TransactionMessageQueue {
  private queue: IMessage[] = [];

  constructor(private messageSender: IMessageSender) {}

  queueMessage(message: IMessage) {
    this.queue.push(message);
  }

  queueMessages(messages: IMessage[]) {
    this.queue.push(...messages);
  }

  dispatch() {
    for (const message of this.queue) {
      this.messageSender.send(message);
    }
  }
}
