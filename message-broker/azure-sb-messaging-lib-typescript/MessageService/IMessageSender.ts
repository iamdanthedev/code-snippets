import { IMessage, TransactionCtx } from "~/common/interface";

export interface IMessageSender {
  send<T extends {}>(message: IMessage, trx?: TransactionCtx);
}

export const IMessageSenderType = Symbol("IMessageSender");
