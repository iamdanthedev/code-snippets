import { injectable } from "inversify";
import { Message } from "./Message";

@injectable()
export abstract class MessageHandler<T extends Message> {
  public message: T;

  abstract handle(): Promise<any>;
}
