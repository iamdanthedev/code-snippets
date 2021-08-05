/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface IContactPersonDeassignedEvent {
  contactPersonId: string;
  customerIds: string[];
}

export class ContactPersonDeassignedEvent
  extends Message
  implements IContactPersonDeassignedEvent {
  contactPersonId: string;
  customerIds: string[];

  constructor(eventData: IContactPersonDeassignedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
