import { IMessageSender } from "./IMessageSender";

export class NullMessageSender implements IMessageSender {
  send(...args: any[]) {
    void 0;
  }
}
