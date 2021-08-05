/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface IBookingCanceledEvent {
  bookingId: string;
  userId: string;
}

export class BookingCanceledEvent
  extends Message
  implements IBookingCanceledEvent {
  bookingId: string;
  userId: string;

  constructor(eventData: IBookingCanceledEvent) {
    super();
    Object.assign(this, eventData);
  }
}
