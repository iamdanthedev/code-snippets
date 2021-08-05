/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface IBookingCostsClearedEvent {
  bookingId: string;
  workplaceName: string;
  consultantId: string;
  consultantName: string;
}

export class BookingCostsClearedEvent
  extends Message
  implements IBookingCostsClearedEvent {
  bookingId: string;
  workplaceName: string;
  consultantId: string;
  consultantName: string;

  constructor(eventData: IBookingCostsClearedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
