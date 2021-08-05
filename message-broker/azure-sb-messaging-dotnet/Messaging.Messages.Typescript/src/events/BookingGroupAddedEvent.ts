/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface IBookingGroupAddedEvent {
  bookingGroupId: string;
  bookingIds: string[];
  bookingWeeks: string[];
  consultantId: string;
  consultantName: string;
  workRequestId: string;
  workplaceName: string;
  departmentName: string;
  userId: string;
  userName: string;
}

export class BookingGroupAddedEvent
  extends Message
  implements IBookingGroupAddedEvent {
  bookingGroupId: string;
  bookingIds: string[];
  bookingWeeks: string[];
  consultantId: string;
  consultantName: string;
  workRequestId: string;
  workplaceName: string;
  departmentName: string;
  userId: string;
  userName: string;

  constructor(eventData: IBookingGroupAddedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
