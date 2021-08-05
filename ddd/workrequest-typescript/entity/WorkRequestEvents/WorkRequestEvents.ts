import { ObjectID } from "bson";
import { InvalidInputError } from "~/common/errors";
import { WorkRequestEvent } from "../../EventLog/WorkRequestEvent";

export class WorkRequestEvents {
  constructor(private _items: () => WorkRequestEvent.BaseWorkRequestEvent[]) {}

  get all() {
    return this._items().filter(x => !x.deleted);
  }

  getById(id: ObjectID) {
    return this._items()?.find(x => x._id.equals(id));
  }

  add(event: WorkRequestEvent.BaseWorkRequestEvent) {
    this._items().push(event);
  }

  update(event: WorkRequestEvent.BaseWorkRequestEvent) {
    if (!this.getById(event._id)) {
      throw new InvalidInputError(`File ${event._id} is not attached`);
    }

    this._items().pushOrUpdate(event, x => x._id.equals(event._id));
  }
}
