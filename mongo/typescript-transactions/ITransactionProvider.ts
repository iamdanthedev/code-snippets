import { ClientSession, MongoClient, TransactionOptions } from "mongodb";
import { IMessage } from "./IMessage";

export const ITransactionProviderType = Symbol("ITransactionProviderType");

export type WithTransactionOptions = TransactionOptions & {
  retry: boolean;
};

export interface ITransactionProvider {
  withTransaction<T>(cb: WithTransactionCb<T>): Promise<T>;
  withTransaction<T>(
    options: WithTransactionOptions,
    cb: WithTransactionCb<T>
  ): Promise<T>;
}

export type TransactionCtx = {
  attempt: number;
  client: MongoClient;
  session: ClientSession;
  queueMessage: (message: IMessage) => void;
  queueMessages: (messages: IMessage[]) => void;
};

export type WithTransactionCb<T> = (transactionArgs: TransactionCtx) => Promise<T>;
