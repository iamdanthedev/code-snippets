import { inject, injectable } from "inversify";
import { ClientSession, MongoClient, TransactionOptions } from "mongodb";
import {
  IDbProvider,
  IDbProviderType,
  ITransactionProvider,
  TransactionCtx,
  WithTransactionCb,
  WithTransactionOptions
} from "~/common/interface";
import { IMessageSender, IMessageSenderType } from "~/Service";
import { TransactionMessageQueue } from "./TransactionMessageQueue";
import { omit, waitAsync } from "~/common";
import { timeout } from "async";

interface MyClientSession extends ClientSession {
  withTransaction: any;
}

@injectable()
export class TransactionProvider implements ITransactionProvider {
  constructor(
    @inject(IDbProviderType) private dbProvider: IDbProvider,
    @inject(IMessageSenderType) private messageSender: IMessageSender
  ) {}

  withTransaction<T>(cb: WithTransactionCb<T>): Promise<T>;
  withTransaction<T>(options: TransactionOptions, cb: WithTransactionCb<T>): Promise<T>;
  async withTransaction<T>(
    arg1: TransactionOptions | WithTransactionCb<T>,
    arg2?: WithTransactionCb<T>
  ) {
    const cb = arguments.length === 1 ? (arg1 as WithTransactionCb<T>) : arg2;
    const options = arguments.length === 2 ? (arg1 as WithTransactionOptions) : undefined;

    const client = this.dbProvider.client();
    const session = client.startSession() as MyClientSession; // because we use the old typings
    const messageQueue = new TransactionMessageQueue(this.messageSender);

    const transactionOptions = omit(options, "retry");

    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          return this.exec(
            session,
            client,
            messageQueue,
            transactionOptions,
            attempt,
            cb
          );
        } catch (e) {
          if (attempt === 2) {
            throw e;
          }

          await waitAsync(attempt * 500 + 500);
        }
      }
    } catch (e) {
      await session.endSession();
      console.error(e);
      throw e;
    }
  }

  private async exec<T>(
    session: MyClientSession,
    client: MongoClient,
    messageQueue: TransactionMessageQueue,
    transactionOptions: TransactionOptions,
    attempt: number,
    cb: WithTransactionCb<T>
  ): Promise<T> {
    let result: T;

    await session.withTransaction(async () => {
      const trx: TransactionCtx = {
        attempt,
        client,
        session,
        queueMessage: messageQueue.queueMessage.bind(messageQueue),
        queueMessages: messageQueue.queueMessages.bind(messageQueue)
      };

      result = await cb(trx);
      messageQueue.dispatch();
    }, transactionOptions);

    await session.endSession();
    return result;
  }
}
