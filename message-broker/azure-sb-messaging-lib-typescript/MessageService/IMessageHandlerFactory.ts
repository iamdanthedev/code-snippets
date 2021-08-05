import { MessageHandler } from "./MessageHandler";
import { Message } from "./Message";

export const IMessageHandlerFactoryType = Symbol("IMessageHandlerFactory");

export interface IMessageHandlerFactory {
  getHandler<T extends Message>(name: string, data: any): MessageHandler<T>;
}
