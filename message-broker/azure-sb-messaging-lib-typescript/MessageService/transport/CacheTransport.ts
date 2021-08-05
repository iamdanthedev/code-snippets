import { injectable, interfaces } from "inversify";
import { isEqual } from "lodash";
import { isObjectId } from "~/common/isObjectId";
import { OnMessageCallback, IMessageServiceTransport } from "../IMessageServiceTransport";
import { Message } from "../Message";

@injectable()
export class CacheTransport implements IMessageServiceTransport {
  private static Messages: Message[] = [];

  initReceiver(): Promise<any> {
    return Promise.resolve();
  }

  initSubscriber(): Promise<any> {
    return Promise.resolve();
  }

  onMessage(cb: OnMessageCallback) {}

  async sendMessage(message: Message): Promise<any> {
    CacheTransport.Messages.push(message);
  }

  clear() {
    CacheTransport.Messages = [];
  }

  expectContainsMessage<T extends Message>(
    messageCtor: interfaces.Newable<T>,
    match?: Partial<T> | ((v: T) => boolean)
  ) {
    const messages = CacheTransport.Messages.filter(
      x => x.$name === messageCtor.name
    ) as T[];

    if (messages.length === 0) {
      throw new Error(`message "${messageCtor.name}" not found`);
    }

    if (!match) {
      return;
    }

    for (const message of messages) {
      const _isMatch =
        typeof match === "function" ? match(message) : this.compare(message, match);

      if (_isMatch) {
        return;
      }
    }

    throw new Error(`message "${messageCtor}" is found, but message body doesn't match
    found: ${JSON.stringify(messages, null, 2)}`);
  }

  compare(source: Message, target: Partial<Message>) {
    let result = true;

    for (const key in target) {
      if (target.hasOwnProperty(key)) {
        const val = target[key];
        const sourceVal = source[key];

        result = isObjectId(val)
          ? result && val.equals(source[key])
          : result && isEqual(val, sourceVal);
      }
    }

    return result;
  }
}
