/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface ITele2NotificationReceivedEvent {
  response: any;
}

export class Tele2NotificationReceivedEvent
  extends Message
  implements ITele2NotificationReceivedEvent {
  response: any;

  constructor(eventData: ITele2NotificationReceivedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
