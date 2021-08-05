import { ObjectID } from "bson";
import { IOperationContext } from "~/common/interface";

// see https://docs.microsoft.com/en-us/azure/azure-monitor/app/correlation
export class OperationContext implements IOperationContext {
  operationId: string; // the very root id of the chain of operations
  parentOperationId: string; // parent of this operation
  eventId: string;

  constructor(parentOperationId: string) {
    this.operationId = new ObjectID().toHexString();
    this.parentOperationId = parentOperationId;
    this.eventId = new ObjectID().toHexString();
  }
}
