/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface IConsultantApplicationRegisteredEvent {
  consultantId: string;
  areaOfExpertise: string;
  source: string;
}

export class ConsultantApplicationRegisteredEvent
  extends Message
  implements IConsultantApplicationRegisteredEvent {
  consultantId: string;
  areaOfExpertise: string;
  source: string;

  constructor(eventData: IConsultantApplicationRegisteredEvent) {
    super();
    Object.assign(this, eventData);
  }
}
