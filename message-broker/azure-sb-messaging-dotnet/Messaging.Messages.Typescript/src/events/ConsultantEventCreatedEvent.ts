/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface IConsultantEventCreatedEvent {
  consultantId: string;
  userId: string;
  eventId: string;
}

export class ConsultantEventCreatedEvent
  extends Message
  implements IConsultantEventCreatedEvent {
  consultantId: string;
  userId: string;
  eventId: string;

  constructor(eventData: IConsultantEventCreatedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
