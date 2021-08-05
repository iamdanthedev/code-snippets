/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface IConsultantBookmarkedWorkrequestEvent {
  consultantId: string;
  workRequestId: string;
  isBookmarked: boolean;
}

export class ConsultantBookmarkedWorkrequestEvent
  extends Message
  implements IConsultantBookmarkedWorkrequestEvent {
  consultantId: string;
  workRequestId: string;
  isBookmarked: boolean;

  constructor(eventData: IConsultantBookmarkedWorkrequestEvent) {
    super();
    Object.assign(this, eventData);
  }
}
