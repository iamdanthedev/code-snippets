/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface ICustomerNotReviewedTimereportEvent {
  timereportId: string;
  hoursSinceSent: number;
  consultantId: string;
  consultantName: string;
  bookingId: string;
  week: number;
  year: number;
}

export class CustomerNotReviewedTimereportEvent
  extends Message
  implements ICustomerNotReviewedTimereportEvent {
  timereportId: string;
  hoursSinceSent: number;
  consultantId: string;
  consultantName: string;
  bookingId: string;
  week: number;
  year: number;

  constructor(eventData: ICustomerNotReviewedTimereportEvent) {
    super();
    Object.assign(this, eventData);
  }
}
