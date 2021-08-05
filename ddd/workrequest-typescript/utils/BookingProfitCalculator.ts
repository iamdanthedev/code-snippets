import { ObjectID } from "bson";
import { isEmpty, isNumber, toFinite, round } from "lodash";
import { WorkRequestAggregate } from "~/Domain/service";
import { Booking, Invoice } from "~/Domain/types";

// profit = net income minus costs

interface BookingProfit {
  profitNet: number | null;
  invoiceTotal: number;
  profitRatio: number | null;
}

export class BookingProfitCalculator {
  profitRatioPrecision = 2;

  calculate(
    workRequest: WorkRequestAggregate,
    bookingId: ObjectID
  ): BookingProfit | null {
    const booking = workRequest.getBooking(bookingId);

    // switched off, see https://github.com/Bonliva/CRM/issues/8809
    // if (!booking.costs) {
    //   return null;
    // }

    const invoices = workRequest.getBookingInvoices(bookingId);
    const invoiceTotal = round(this.getInvoiceTotal(invoices, booking), 2);

    // switched off, see https://github.com/Bonliva/CRM/issues/8809
    // if (!this.canCalculate(booking, invoiceTotal)) {
    //   return null;
    // }

    const totalCosts = booking.costs?.getTotalCosts() ?? 0;
    const profitNet =
      round(invoiceTotal - totalCosts, 2) - toFinite(booking.customerFine);

    const profitRatio =
      totalCosts > 0 && invoiceTotal > 0
        ? round(profitNet / invoiceTotal, this.profitRatioPrecision)
        : null;

    return { profitNet, invoiceTotal, profitRatio };
  }

  private canCalculate(booking: Booking, invoiceTotal: number) {
    if (!isNumber(invoiceTotal) || invoiceTotal <= 0) {
      return false;
    }

    return (
      isNumber(booking.customerInvoicing.groupInvoiceTotal) ||
      !isEmpty(booking.customerInvoicing.invoiceNumbers)
    );
  }

  private getInvoiceTotal(invoices: Invoice[], booking: Booking) {
    if (isNumber(booking.customerInvoicing.groupInvoiceTotal)) {
      return booking.customerInvoicing.groupInvoiceTotal;
    }

    let result = 0;

    for (const invoiceNumber of booking.customerInvoicing.invoiceNumbers) {
      const invoice = invoices.compact().find(x => x.InvoiceNumber === invoiceNumber);

      if (!invoice) {
        continue;
        // throw new Error(`cannot get invoice ${invoiceNumber}`);
      }

      result += invoice.TotalNet;
    }

    return result;
  }
}
