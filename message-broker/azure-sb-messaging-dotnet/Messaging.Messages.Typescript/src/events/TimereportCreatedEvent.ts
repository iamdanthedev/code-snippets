/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface ITimereportCreatedEvent {
  timereportId: string;
  bookingId: string;
  consultantId: string;
  workplace: string;
  department: string;
  startsOnUtc: string;
  week: number;
  year: number;
}

export class TimereportCreatedEvent
  extends Message
  implements ITimereportCreatedEvent {
  timereportId: string;
  bookingId: string;
  consultantId: string;
  workplace: string;
  department: string;
  startsOnUtc: string;
  week: number;
  year: number;

  constructor(eventData: ITimereportCreatedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
