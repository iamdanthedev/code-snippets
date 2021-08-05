/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface IConsultantSignedInToConsultantAppEvent {
  consultantId: string;
  consultantName: string;
  firstTime: boolean;
}

export class ConsultantSignedInToConsultantAppEvent
  extends Message
  implements IConsultantSignedInToConsultantAppEvent {
  consultantId: string;
  consultantName: string;
  firstTime: boolean;

  constructor(eventData: IConsultantSignedInToConsultantAppEvent) {
    super();
    Object.assign(this, eventData);
  }
}
