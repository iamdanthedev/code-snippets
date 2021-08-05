import { FilterQuery } from "mongodb";
import BSON, { EJSON } from "bson";

export class MongoBulkWriter<T = any> {
  private operations: Record<string, unknown>[] = [];

  constructor() {}

  deleteMany(filter: FilterQuery<T>) {
    this.operations.push({
      deleteMany: { filter }
    });
  }

  updateOne(filter: FilterQuery<T>, update: Record<string, unknown>) {
    this.operations.push({
      updateOne: { filter, update }
    });
  }

  updateMany(filter: FilterQuery<T>, update: Record<string, unknown>) {
    this.operations.push({
      updateMany: { filter, update }
    });
  }

  replaceOne(filter: FilterQuery<T>, replacement: Record<string, unknown>) {
    this.operations.push({
      replaceOne: { filter, replacement }
    });
  }

  insertOne(document: Record<string, unknown>) {
    this.operations.push({
      insertOne: { document }
    });
  }

  getOperations() {
    return this.operations;
  }

  toJson() {
    return JSON.stringify(EJSON.serialize(this.operations), null, 4);
  }
}
