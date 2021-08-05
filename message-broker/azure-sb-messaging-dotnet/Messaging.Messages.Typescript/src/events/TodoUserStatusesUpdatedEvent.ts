/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface ITodoUserStatusesUpdatedEvent {
  todoId: string;
}

export class TodoUserStatusesUpdatedEvent
  extends Message
  implements ITodoUserStatusesUpdatedEvent {
  todoId: string;

  constructor(eventData: ITodoUserStatusesUpdatedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
