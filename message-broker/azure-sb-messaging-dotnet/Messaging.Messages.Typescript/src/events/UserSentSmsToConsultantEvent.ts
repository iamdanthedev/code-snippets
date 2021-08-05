/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface IUserSentSmsToConsultantEvent {
  messageId: string;
  sentOn: string;
  consultantId: string;
  userId: string;
}

export class UserSentSmsToConsultantEvent
  extends Message
  implements IUserSentSmsToConsultantEvent {
  messageId: string;
  sentOn: string;
  consultantId: string;
  userId: string;

  constructor(eventData: IUserSentSmsToConsultantEvent) {
    super();
    Object.assign(this, eventData);
  }
}
