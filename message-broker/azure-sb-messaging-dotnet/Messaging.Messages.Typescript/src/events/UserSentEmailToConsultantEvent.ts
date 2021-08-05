/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface IUserSentEmailToConsultantEvent {
  subject: string;
  body: string;
  consultantId: string;
  userId: string;
}

export class UserSentEmailToConsultantEvent
  extends Message
  implements IUserSentEmailToConsultantEvent {
  subject: string;
  body: string;
  consultantId: string;
  userId: string;

  constructor(eventData: IUserSentEmailToConsultantEvent) {
    super();
    Object.assign(this, eventData);
  }
}
