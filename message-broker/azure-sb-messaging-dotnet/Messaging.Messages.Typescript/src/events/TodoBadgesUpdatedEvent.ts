/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface ITodoBadgesUpdatedEvent {
  userIds: string[];
}

export class TodoBadgesUpdatedEvent
  extends Message
  implements ITodoBadgesUpdatedEvent {
  userIds: string[];

  constructor(eventData: ITodoBadgesUpdatedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
