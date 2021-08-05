/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface ITodoMarkCompletedAsWatchedEvent {
  todoIds: string[];
}

export class TodoMarkCompletedAsWatchedEvent
  extends Message
  implements ITodoMarkCompletedAsWatchedEvent {
  todoIds: string[];

  constructor(eventData: ITodoMarkCompletedAsWatchedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
