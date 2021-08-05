/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface ITodoDelegatedEvent {
  todoId: string;
}

export class TodoDelegatedEvent extends Message implements ITodoDelegatedEvent {
  todoId: string;

  constructor(eventData: ITodoDelegatedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
