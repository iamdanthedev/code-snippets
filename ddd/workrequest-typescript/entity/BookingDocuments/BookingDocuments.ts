import { ObjectID } from "bson";
import { InvalidInputError } from "~/common/errors";
import { BookingDocument } from "../types/BookingDocument";

export class BookingDocuments {
  constructor(private _getFiles: () => BookingDocument[]) {}

  get all() {
    return this._getFiles();
  }

  hasAttachment(attId: ObjectID) {
    return this._getFiles()?.any(x => x.fileRef?.NodeID.equals(attId));
  }

  getAttachmentById(attId: ObjectID) {
    return this._getFiles()?.find(x => x.fileRef?.NodeID.equals(attId));
  }

  addAttachment(doc: BookingDocument) {
    if (this.hasAttachment(doc.fileRef.NodeID)) {
      throw new InvalidInputError(`File ${doc.fileRef.NodeID} already attached`);
    }

    this._getFiles().push({ fileRef: doc.fileRef, documentType: doc.documentType });
  }

  removeAttachment(attId: ObjectID) {
    if (!this.hasAttachment(attId)) {
      throw new InvalidInputError(`File ${attId} is not attached`);
    }

    this._getFiles().remove(x => x.fileRef.NodeID.equals(attId));
  }
}
