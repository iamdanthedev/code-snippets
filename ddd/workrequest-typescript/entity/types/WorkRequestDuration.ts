import { ObjectID } from "bson";
import { DurationType } from "~/Domain/types";

export class WorkRequestDuration {
  static CreateWeekType(from: Date, to: Date) {
    const duration = new WorkRequestDuration();
    duration.durationType = DurationType.Week;
    duration.from = from;
    duration.to = to;
    duration.busyRatio = 1;
    duration.comment = "";
    duration.vacancies = 1;
    return duration;
  }

  private constructor() {}

  _id: ObjectID = new ObjectID();
  durationType: DurationType;
  from: Date;
  to: Date;
  busyRatio: number;
  comment: string;
  vacancies: number;
}
