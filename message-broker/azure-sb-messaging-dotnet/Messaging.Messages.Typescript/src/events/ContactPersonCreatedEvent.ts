/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface IContactPersonCreatedEvent {
  contactPersonId: string;
  userId: string;
}

export class ContactPersonCreatedEvent
  extends Message
  implements IContactPersonCreatedEvent {
  contactPersonId: string;
  userId: string;

  constructor(eventData: IContactPersonCreatedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
