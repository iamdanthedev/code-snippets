import { ObjectID } from "bson";
import { NodeRef } from "~/Domain/ref";

export class WorkRequestApplication {
  constructor(appliedOn: Date, consultantRef: NodeRef) {
    this.appliedOn = appliedOn;
    this.consultantRef = consultantRef;
  }

  _id = new ObjectID();
  appliedOn: Date;
  consultantRef: NodeRef;
}
