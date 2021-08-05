/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface ITimereportSentToOcEvent {
  timereportId: string;
  userId: string;
  userName: string;
}

export class TimereportSentToOcEvent
  extends Message
  implements ITimereportSentToOcEvent {
  timereportId: string;
  userId: string;
  userName: string;

  constructor(eventData: ITimereportSentToOcEvent) {
    super();
    Object.assign(this, eventData);
  }
}
