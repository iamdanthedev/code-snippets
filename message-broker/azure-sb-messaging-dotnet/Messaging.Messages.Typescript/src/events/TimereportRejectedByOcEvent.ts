/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface ITimereportRejectedByOcEvent {
  timereportId: string;
  userId: string;
  userName: string;
}

export class TimereportRejectedByOcEvent
  extends Message
  implements ITimereportRejectedByOcEvent {
  timereportId: string;
  userId: string;
  userName: string;

  constructor(eventData: ITimereportRejectedByOcEvent) {
    super();
    Object.assign(this, eventData);
  }
}
