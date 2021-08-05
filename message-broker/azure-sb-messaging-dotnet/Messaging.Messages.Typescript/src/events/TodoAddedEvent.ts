/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface ITodoAddedEvent {
  todoId: string;
}

export class TodoAddedEvent extends Message implements ITodoAddedEvent {
  todoId: string;

  constructor(eventData: ITodoAddedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
