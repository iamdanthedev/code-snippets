/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface IBookingCreatedEvent {
  bookingId: string;
  bookingGroupId: string;
  bookingWeek: string;
  consultantId: string;
  consultantName: string;
  workRequestId: string;
  workplaceName: string;
  workplaceId: string;
  departmentName: string;
  departmentId: string;
  userId: string;
  userName: string;
}

export class BookingCreatedEvent
  extends Message
  implements IBookingCreatedEvent {
  bookingId: string;
  bookingGroupId: string;
  bookingWeek: string;
  consultantId: string;
  consultantName: string;
  workRequestId: string;
  workplaceName: string;
  workplaceId: string;
  departmentName: string;
  departmentId: string;
  userId: string;
  userName: string;

  constructor(eventData: IBookingCreatedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
