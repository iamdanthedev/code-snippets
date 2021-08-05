/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface ITodoEventAddedEvent {
  todoId: string;
  eventId: string;
}

export class TodoEventAddedEvent
  extends Message
  implements ITodoEventAddedEvent {
  todoId: string;
  eventId: string;

  constructor(eventData: ITodoEventAddedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
