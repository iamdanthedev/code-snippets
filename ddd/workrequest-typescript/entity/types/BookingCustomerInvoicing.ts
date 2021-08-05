import { Column, Entity } from "~/Domain/metadata";

@Entity()
export class BookingCustomerInvoicing {
  /**
   * When GroupInvoicing = true this is the invoiced total
   */
  @Column()
  groupInvoiceTotal: number | null = null;

  @Column({ expose: "invoiceNumbers" })
  private _invoiceNumbers: string[] = [];

  get invoiceNumbers(): string[] {
    return this._invoiceNumbers;
  }

  addInvoiceNumber(invoiceNumber: string) {
    if (this._invoiceNumbers.includes(invoiceNumber)) {
      return;
    }

    this._invoiceNumbers.push(invoiceNumber);
  }

  hasInvoiceNumber(invoiceNumber: string) {
    return this._invoiceNumbers.includes(invoiceNumber);
  }

  removeInvoiceNumber(invoiceNumber: string) {
    this._invoiceNumbers.remove(x => x === invoiceNumber);
  }

  get isBilled() {
    return this._invoiceNumbers.length > 0;
  }
}
