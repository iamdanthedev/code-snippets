import { ObjectID } from "bson";

export class BookingWeekSearch {
  invoiceNumbers: string[];
  searchField: string;
  project: string;
  projectMembers: ObjectID[]; // all project members (admin + owner + members)
}
