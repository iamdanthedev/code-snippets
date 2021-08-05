/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface IConsultantQualityItemStatusSetEvent {
  userId: string;
  consultantId: string;
  country: string;
  qualityItemName: string;
  statusName: string;
  comment: string;
}

export class ConsultantQualityItemStatusSetEvent
  extends Message
  implements IConsultantQualityItemStatusSetEvent {
  userId: string;
  consultantId: string;
  country: string;
  qualityItemName: string;
  statusName: string;
  comment: string;

  constructor(eventData: IConsultantQualityItemStatusSetEvent) {
    super();
    Object.assign(this, eventData);
  }
}
