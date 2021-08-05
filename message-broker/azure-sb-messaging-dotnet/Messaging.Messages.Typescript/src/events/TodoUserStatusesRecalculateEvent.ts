/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface ITodoUserStatusesRecalculateEvent {
  userId: string;
}

export class TodoUserStatusesRecalculateEvent
  extends Message
  implements ITodoUserStatusesRecalculateEvent {
  userId: string;

  constructor(eventData: ITodoUserStatusesRecalculateEvent) {
    super();
    Object.assign(this, eventData);
  }
}
