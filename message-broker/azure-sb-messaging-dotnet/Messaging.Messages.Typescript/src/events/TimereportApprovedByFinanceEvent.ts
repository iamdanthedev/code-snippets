/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface ITimereportApprovedByFinanceEvent {
  timereportId: string;
  userId: string;
  userName: string;
}

export class TimereportApprovedByFinanceEvent
  extends Message
  implements ITimereportApprovedByFinanceEvent {
  timereportId: string;
  userId: string;
  userName: string;

  constructor(eventData: ITimereportApprovedByFinanceEvent) {
    super();
    Object.assign(this, eventData);
  }
}
