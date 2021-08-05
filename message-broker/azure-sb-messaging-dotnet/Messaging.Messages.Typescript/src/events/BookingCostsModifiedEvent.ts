/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface IBookingCostsModifiedEvent {
  bookingId: string;
  workplaceName: string;
  consultantId: string;
  consultantName: string;
  isConsultantPayed: boolean;
  consultantBillTotal: number;
}

export class BookingCostsModifiedEvent
  extends Message
  implements IBookingCostsModifiedEvent {
  bookingId: string;
  workplaceName: string;
  consultantId: string;
  consultantName: string;
  isConsultantPayed: boolean;
  consultantBillTotal: number;

  constructor(eventData: IBookingCostsModifiedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
