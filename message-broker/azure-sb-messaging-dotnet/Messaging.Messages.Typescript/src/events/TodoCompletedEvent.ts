/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface ITodoCompletedEvent {
  todoId: string;
}

export class TodoCompletedEvent extends Message implements ITodoCompletedEvent {
  todoId: string;

  constructor(eventData: ITodoCompletedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
