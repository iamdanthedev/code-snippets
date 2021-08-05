/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface ITodoUpdatedEvent {
  todoId: string;
}

export class TodoUpdatedEvent extends Message implements ITodoUpdatedEvent {
  todoId: string;

  constructor(eventData: ITodoUpdatedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
