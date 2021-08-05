/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface ITodoUserStatusesCreatedEvent {
  todoId: string;
}

export class TodoUserStatusesCreatedEvent
  extends Message
  implements ITodoUserStatusesCreatedEvent {
  todoId: string;

  constructor(eventData: ITodoUserStatusesCreatedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
