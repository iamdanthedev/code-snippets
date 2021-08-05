/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface ITimereportSentToCustomerEvent {
  timereportId: string;
  sentByUserId: string;
  sentByUserName: string;
  contactPersons: string[];
}

export class TimereportSentToCustomerEvent
  extends Message
  implements ITimereportSentToCustomerEvent {
  timereportId: string;
  sentByUserId: string;
  sentByUserName: string;
  contactPersons: string[];

  constructor(eventData: ITimereportSentToCustomerEvent) {
    super();
    Object.assign(this, eventData);
  }
}
