/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { TimereportStatus } from "./TimereportStatus";

import { Message } from "../Message";

export interface ITimereportStatusChangedEvent {
  timereportId: string;
  year: number;
  week: number;
  workplace: string;
  department: string;
  bookingId: string;
  consultantId: string;
  status: TimereportStatus;
  currentStatus: string;
  userName: string;
  userId: string;
}

export class TimereportStatusChangedEvent
  extends Message
  implements ITimereportStatusChangedEvent {
  timereportId: string;
  year: number;
  week: number;
  workplace: string;
  department: string;
  bookingId: string;
  consultantId: string;
  status: TimereportStatus;
  currentStatus: string;
  userName: string;
  userId: string;

  constructor(eventData: ITimereportStatusChangedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
