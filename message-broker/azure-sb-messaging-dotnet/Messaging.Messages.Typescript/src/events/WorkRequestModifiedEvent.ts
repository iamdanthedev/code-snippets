/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { WorkrequestStatus } from "./WorkrequestStatus";

import { Message } from "../Message";

export interface IWorkRequestModifiedEvent {
  workRequestId: string;
  status: WorkrequestStatus;
  isNew: boolean;
  isDeleted: boolean;
}

export class WorkRequestModifiedEvent
  extends Message
  implements IWorkRequestModifiedEvent {
  workRequestId: string;
  status: WorkrequestStatus;
  isNew: boolean;
  isDeleted: boolean;

  constructor(eventData: IWorkRequestModifiedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
