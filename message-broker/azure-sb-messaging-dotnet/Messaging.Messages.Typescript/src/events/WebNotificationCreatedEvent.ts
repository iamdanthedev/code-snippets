/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface IWebNotificationCreatedEvent {
  notificationId: string;
}

export class WebNotificationCreatedEvent
  extends Message
  implements IWebNotificationCreatedEvent {
  notificationId: string;

  constructor(eventData: IWebNotificationCreatedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
