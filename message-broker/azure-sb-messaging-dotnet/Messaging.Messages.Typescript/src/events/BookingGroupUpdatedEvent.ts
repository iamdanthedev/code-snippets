/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface IBookingGroupUpdatedEvent {
  bookingGroupId: string;
  consultantId: string;
  userId: string;
  workrequestId: string;
  isConsultantChanged: boolean;
  isCustomerChanged: boolean;
}

export class BookingGroupUpdatedEvent
  extends Message
  implements IBookingGroupUpdatedEvent {
  bookingGroupId: string;
  consultantId: string;
  userId: string;
  workrequestId: string;
  isConsultantChanged: boolean;
  isCustomerChanged: boolean;

  constructor(eventData: IBookingGroupUpdatedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
