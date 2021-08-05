/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface ITimereportApprovedByHbaEvent {
  timereportId: string;
  userId: string;
  userName: string;
}

export class TimereportApprovedByHbaEvent
  extends Message
  implements ITimereportApprovedByHbaEvent {
  timereportId: string;
  userId: string;
  userName: string;

  constructor(eventData: ITimereportApprovedByHbaEvent) {
    super();
    Object.assign(this, eventData);
  }
}
