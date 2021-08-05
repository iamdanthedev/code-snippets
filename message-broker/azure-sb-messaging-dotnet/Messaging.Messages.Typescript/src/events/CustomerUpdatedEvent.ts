/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface ICustomerUpdatedEvent {
  customerId: string;
  userId: string;
}

export class CustomerUpdatedEvent
  extends Message
  implements ICustomerUpdatedEvent {
  customerId: string;
  userId: string;

  constructor(eventData: ICustomerUpdatedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
