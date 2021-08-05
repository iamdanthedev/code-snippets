/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface ITimereportApprovedByCustomerEvent {
  approvedBy: string;
  consultantId: string;
  consultantName: string;
  timereportId: string;
  bookingId: string;
  week: number;
  year: number;
}

export class TimereportApprovedByCustomerEvent
  extends Message
  implements ITimereportApprovedByCustomerEvent {
  approvedBy: string;
  consultantId: string;
  consultantName: string;
  timereportId: string;
  bookingId: string;
  week: number;
  year: number;

  constructor(eventData: ITimereportApprovedByCustomerEvent) {
    super();
    Object.assign(this, eventData);
  }
}
