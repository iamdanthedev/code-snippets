/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface IWorkRequestPublishedEvent {
  workRequestId: string;
}

export class WorkRequestPublishedEvent
  extends Message
  implements IWorkRequestPublishedEvent {
  workRequestId: string;

  constructor(eventData: IWorkRequestPublishedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
