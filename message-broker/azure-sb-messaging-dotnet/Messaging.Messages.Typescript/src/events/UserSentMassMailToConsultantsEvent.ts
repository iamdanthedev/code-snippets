/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface IUserSentMassMailToConsultantsEvent {
  subject: string;
  body: string;
  userId: string;
  consultantIds: string[];
}

export class UserSentMassMailToConsultantsEvent
  extends Message
  implements IUserSentMassMailToConsultantsEvent {
  subject: string;
  body: string;
  userId: string;
  consultantIds: string[];

  constructor(eventData: IUserSentMassMailToConsultantsEvent) {
    super();
    Object.assign(this, eventData);
  }
}
