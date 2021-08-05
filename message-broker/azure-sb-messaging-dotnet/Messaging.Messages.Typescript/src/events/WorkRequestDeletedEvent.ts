/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface IWorkRequestDeletedEvent {
  workRequestId: string;
}

export class WorkRequestDeletedEvent
  extends Message
  implements IWorkRequestDeletedEvent {
  workRequestId: string;

  constructor(eventData: IWorkRequestDeletedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
