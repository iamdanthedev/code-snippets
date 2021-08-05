/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface ITimereportSentToFinanceEvent {
  timereportId: string;
  userId: string;
  userName: string;
}

export class TimereportSentToFinanceEvent
  extends Message
  implements ITimereportSentToFinanceEvent {
  timereportId: string;
  userId: string;
  userName: string;

  constructor(eventData: ITimereportSentToFinanceEvent) {
    super();
    Object.assign(this, eventData);
  }
}
