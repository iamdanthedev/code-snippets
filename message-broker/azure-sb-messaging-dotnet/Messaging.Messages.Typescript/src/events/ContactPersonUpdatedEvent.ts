/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface IContactPersonUpdatedEvent {
  contactPersonId: string;
}

export class ContactPersonUpdatedEvent
  extends Message
  implements IContactPersonUpdatedEvent {
  contactPersonId: string;

  constructor(eventData: IContactPersonUpdatedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
