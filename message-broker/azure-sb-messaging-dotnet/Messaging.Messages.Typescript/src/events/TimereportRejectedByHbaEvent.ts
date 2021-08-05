/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface ITimereportRejectedByHbaEvent {
  timereportId: string;
  userId: string;
  userName: string;
}

export class TimereportRejectedByHbaEvent
  extends Message
  implements ITimereportRejectedByHbaEvent {
  timereportId: string;
  userId: string;
  userName: string;

  constructor(eventData: ITimereportRejectedByHbaEvent) {
    super();
    Object.assign(this, eventData);
  }
}
