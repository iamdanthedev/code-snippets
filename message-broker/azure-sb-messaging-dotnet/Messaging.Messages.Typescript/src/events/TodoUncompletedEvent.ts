/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface ITodoUncompletedEvent {
  todoId: string;
}

export class TodoUncompletedEvent
  extends Message
  implements ITodoUncompletedEvent {
  todoId: string;

  constructor(eventData: ITodoUncompletedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
