/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface ITimereportRejectedByFinanceEvent {
  timereportId: string;
  userId: string;
  userName: string;
}

export class TimereportRejectedByFinanceEvent
  extends Message
  implements ITimereportRejectedByFinanceEvent {
  timereportId: string;
  userId: string;
  userName: string;

  constructor(eventData: ITimereportRejectedByFinanceEvent) {
    super();
    Object.assign(this, eventData);
  }
}
