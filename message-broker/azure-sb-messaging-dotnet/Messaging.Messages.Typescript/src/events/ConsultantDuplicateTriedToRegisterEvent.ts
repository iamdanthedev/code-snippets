/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface IConsultantDuplicateTriedToRegisterEvent {
  duplicateOfConsultantId: string;
  registerParams: any;
}

export class ConsultantDuplicateTriedToRegisterEvent
  extends Message
  implements IConsultantDuplicateTriedToRegisterEvent {
  duplicateOfConsultantId: string;
  registerParams: any;

  constructor(eventData: IConsultantDuplicateTriedToRegisterEvent) {
    super();
    Object.assign(this, eventData);
  }
}
