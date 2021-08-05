/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface IConsultantBAChangedEvent {
  consultantId: string;
  userId: string;
}

export class ConsultantBAChangedEvent
  extends Message
  implements IConsultantBAChangedEvent {
  consultantId: string;
  userId: string;

  constructor(eventData: IConsultantBAChangedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
