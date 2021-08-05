/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface IConsultantApplicationDelegatedEvent {
  consultantId: string;
  todoId: string;
  delegatedByUserId: string;
  delegatedToUserId: string;
}

export class ConsultantApplicationDelegatedEvent
  extends Message
  implements IConsultantApplicationDelegatedEvent {
  consultantId: string;
  todoId: string;
  delegatedByUserId: string;
  delegatedToUserId: string;

  constructor(eventData: IConsultantApplicationDelegatedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
