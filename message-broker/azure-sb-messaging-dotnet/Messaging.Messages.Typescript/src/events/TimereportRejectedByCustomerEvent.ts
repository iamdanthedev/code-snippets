/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface ITimereportRejectedByCustomerEvent {
  rejectedBy: string;
  comment: string;
  consultantId: string;
  consultantName: string;
  timereportId: string;
  bookingId: string;
  week: number;
  year: number;
}

export class TimereportRejectedByCustomerEvent
  extends Message
  implements ITimereportRejectedByCustomerEvent {
  rejectedBy: string;
  comment: string;
  consultantId: string;
  consultantName: string;
  timereportId: string;
  bookingId: string;
  week: number;
  year: number;

  constructor(eventData: ITimereportRejectedByCustomerEvent) {
    super();
    Object.assign(this, eventData);
  }
}
