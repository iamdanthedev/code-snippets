import { Invoice } from "../../Invoice";

export class BookingWeekCachedInvoiceData {
  static FromInvoice(invoice: Invoice) {
    return new BookingWeekCachedInvoiceData(
      invoice.InvoiceNumber,
      invoice.TotalGross,
      invoice.TotalNet,
      invoice.TotalNet
    );
  }

  static FromInvoiceNo(invoiceNumber: string) {
    return new BookingWeekCachedInvoiceData(invoiceNumber, 0, 0, 0);
  }

  invoiceTotal: number;
  invoiceNumber: string;
  totalGross: number;
  totalNet: number;

  constructor(
    invoiceNumber: string,
    totalGross: number,
    totalNet: number,
    invoiceTotal: number
  ) {
    this.invoiceNumber = invoiceNumber;
    this.invoiceTotal = invoiceTotal;
    this.totalGross = totalGross;
    this.totalNet = totalNet;
  }
}
