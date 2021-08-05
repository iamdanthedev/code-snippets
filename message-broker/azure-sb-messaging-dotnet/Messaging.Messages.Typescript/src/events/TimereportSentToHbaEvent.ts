/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface ITimereportSentToHbaEvent {
  timereportId: string;
  userId: string;
  userName: string;
}

export class TimereportSentToHbaEvent
  extends Message
  implements ITimereportSentToHbaEvent {
  timereportId: string;
  userId: string;
  userName: string;

  constructor(eventData: ITimereportSentToHbaEvent) {
    super();
    Object.assign(this, eventData);
  }
}
