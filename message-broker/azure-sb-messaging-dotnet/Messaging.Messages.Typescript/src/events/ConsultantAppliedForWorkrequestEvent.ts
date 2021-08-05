/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface IConsultantAppliedForWorkrequestEvent {
  consultantId: string;
  consultantName: string;
  consultantComment: string;
  organisation: string;
  workplace: string;
  department: string;
  workrequestId: string;
  workrequestCrmUrl: string;
}

export class ConsultantAppliedForWorkrequestEvent
  extends Message
  implements IConsultantAppliedForWorkrequestEvent {
  consultantId: string;
  consultantName: string;
  consultantComment: string;
  organisation: string;
  workplace: string;
  department: string;
  workrequestId: string;
  workrequestCrmUrl: string;

  constructor(eventData: IConsultantAppliedForWorkrequestEvent) {
    super();
    Object.assign(this, eventData);
  }
}
