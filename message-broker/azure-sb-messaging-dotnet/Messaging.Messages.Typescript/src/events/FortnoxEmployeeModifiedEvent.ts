/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface IFortnoxEmployeeModifiedEvent {
  fortnoxEmployeeId: string;
  data: any;
}

export class FortnoxEmployeeModifiedEvent
  extends Message
  implements IFortnoxEmployeeModifiedEvent {
  fortnoxEmployeeId: string;
  data: any;

  constructor(eventData: IFortnoxEmployeeModifiedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
