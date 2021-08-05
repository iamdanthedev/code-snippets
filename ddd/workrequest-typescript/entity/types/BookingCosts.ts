import { IsNumber, Min } from "class-validator";
import { Column, Entity } from "~/Domain/metadata";

@Entity({
  getType: value =>
    value.type === "employee" ? EmployeeBookingCosts : SubcontractorBookingCosts
})
export abstract class BookingCosts {
  @Column({ expose: "type" })
  protected _type: "employee" | "subcontractor";

  @Column({ expose: "accommodation" })
  @IsNumber()
  @Min(0)
  protected _accommodation = 0;

  @Column({ expose: "travel" })
  @IsNumber()
  @Min(0)
  protected _travel = 0;

  abstract getTotalCosts(): number;

  get accommodation() {
    return this._accommodation;
  }

  get travel() {
    return this._travel;
  }

  get type() {
    return this._type;
  }

  setTravelCost(value: number) {
    this._travel = value;
  }

  setAccommodationCost(value: number) {
    this._accommodation = value;
  }
}

@Entity()
export class EmployeeBookingCosts extends BookingCosts {
  constructor() {
    super();
    this._type = "employee";
  }

  @Column({ expose: "salary" })
  @IsNumber()
  @Min(0)
  private _salary = 0; // Lön+soc+f.k

  getTotalCosts(): number {
    return this._salary + this._travel + this._accommodation;
  }

  get salary() {
    return this._salary;
  }

  setSalary(value: number) {
    this._salary = value;
  }
}

@Entity()
export class SubcontractorBookingCosts extends BookingCosts {
  constructor() {
    super();
    this._type = "subcontractor";
  }

  @Column({ expose: "invoiceTotal" })
  @IsNumber()
  @Min(0)
  _invoiceTotal = 0; // Fakturabelopp

  getTotalCosts(): number {
    return this._invoiceTotal + this._travel + this._accommodation;
  }

  get invoiceTotal() {
    return this._invoiceTotal;
  }

  setInvoiceTotal(value: number) {
    this._invoiceTotal = value;
  }
}
