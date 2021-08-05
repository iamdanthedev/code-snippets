import { isEmpty } from "lodash";
import { Entity, Subdoc } from "~/Domain/metadata";
import { Customer } from "../../Customer/Customer";
import { CustomerRef } from "../../Customer/CustomerRef";

@Entity()
export class Workplace {
  static Create(customer: Customer, departments: Customer[]) {
    departments.forEach(dept => {
      if (!dept.Parents.any(x => x.Id.equals(customer._id))) {
        throw new Error(`department doesn't belong to a customer`);
      }
    });

    const workplace = new Workplace(
      CustomerRef.Create(customer),
      CustomerRef.CreateMany(departments)
    );

    workplace._departments = departments;
    workplace._customer = customer;

    return workplace;
  }

  @Subdoc(() => CustomerRef)
  customerRef: CustomerRef;

  @Subdoc(() => [CustomerRef])
  departmentRefs: CustomerRef[];

  private _customer: Customer;
  private _departments: Customer[];

  private constructor(customer: CustomerRef, departments: CustomerRef[]) {
    this.customerRef = customer;
    this.departmentRefs = departments;
  }

  get customer() {
    return this._customer;
  }

  get departments() {
    return this._departments;
  }

  get customerId() {
    return this.customerRef?.Id;
  }

  get departmentIds() {
    return !isEmpty(this.departmentRefs) ? this.departmentRefs.map(x => x.Id) : [];
  }
}
