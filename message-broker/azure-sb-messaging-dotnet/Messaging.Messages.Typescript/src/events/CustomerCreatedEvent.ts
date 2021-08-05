/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface ICustomerCreatedEvent {
  customerId: string;
}

export class CustomerCreatedEvent
  extends Message
  implements ICustomerCreatedEvent {
  customerId: string;

  constructor(eventData: ICustomerCreatedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
