import { Message } from "./Message";

export const IMessageServiceTransportType = Symbol("IMessageServiceTransportType");

export type OnMessageCallback = (name: string, body: any, original: any) => any;

export interface IMessageServiceTransport {
  initReceiver(): Promise<any>;
  initSubscriber(): Promise<any>;
  sendMessage(message: Message): Promise<any>;
  onMessage(cb: OnMessageCallback): void;
}
