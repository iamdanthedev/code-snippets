import { ObjectID } from "bson";
import { Column, Entity } from "~/Domain/metadata";
import { NodeRef, WorkRequestRef } from "~/Domain/ref";
import { CustomerRef } from "~/Domain/types";
import { Customer, CustomerSearch } from "../Customer/Customer";
import { WorkRequestSearch } from "./types/WorkRequestSearch";
import { WorkRequest } from "./WorkRequest";

@Entity()
export class WorkRequestWeek {
  static Create(week: Date, workRequest: WorkRequest, customer: Customer) {
    const item = new WorkRequestWeek();

    item.customerRef = CustomerRef.Create(customer);
    item.week = week;
    item.workRequestRef = WorkRequestRef.Create(workRequest);
    item.customerSearch = customer.Search;
    item.workRequestSearch = workRequest.search;

    return item;
  }

  @Column()
  _id: ObjectID = new ObjectID();

  @Column()
  customerRef: CustomerRef;

  @Column()
  week: Date;

  @Column()
  workRequestRef: NodeRef;

  @Column()
  customerSearch: CustomerSearch;

  @Column()
  workRequestSearch: WorkRequestSearch;
}
