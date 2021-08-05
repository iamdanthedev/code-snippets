/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface ISmsMessageUpdatedEvent {
  smsMessageId: string;
}

export class SmsMessageUpdatedEvent
  extends Message
  implements ISmsMessageUpdatedEvent {
  smsMessageId: string;

  constructor(eventData: ISmsMessageUpdatedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
