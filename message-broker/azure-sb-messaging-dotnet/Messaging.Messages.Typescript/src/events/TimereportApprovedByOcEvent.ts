/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface ITimereportApprovedByOcEvent {
  timereportId: string;
  userId: string;
  userName: string;
}

export class TimereportApprovedByOcEvent
  extends Message
  implements ITimereportApprovedByOcEvent {
  timereportId: string;
  userId: string;
  userName: string;

  constructor(eventData: ITimereportApprovedByOcEvent) {
    super();
    Object.assign(this, eventData);
  }
}
