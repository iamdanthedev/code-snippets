/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface IConsultantQualityItemStatusClearedEvent {
  userId: string;
  consultantId: string;
  country: string;
  qualityItemName: string;
}

export class ConsultantQualityItemStatusClearedEvent
  extends Message
  implements IConsultantQualityItemStatusClearedEvent {
  userId: string;
  consultantId: string;
  country: string;
  qualityItemName: string;

  constructor(eventData: IConsultantQualityItemStatusClearedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
