/** auto-generated */
/**
 * This is a TypeGen auto-generated file.
 * Any changes made to this file can be lost when this file is regenerated.
 */

import { Message } from "../Message";

export interface IDocumentUploadedEvent {
  fileId: string;
}

export class DocumentUploadedEvent
  extends Message
  implements IDocumentUploadedEvent {
  fileId: string;

  constructor(eventData: IDocumentUploadedEvent) {
    super();
    Object.assign(this, eventData);
  }
}
