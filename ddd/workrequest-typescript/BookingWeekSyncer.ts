import { BookingWeekRepository } from "~/Domain/repository";
import { WorkRequestAggregate } from "~/Domain/service";
import { BookingWeek, WorkRequestStatus } from "~/Domain/types";
import { TransactionCtx } from "~/common/interface";
import { BookingProfitCalculator } from "./utils/BookingProfitCalculator";

export class BookingWeekSyncer {
  profitCalculator = new BookingProfitCalculator();

  constructor(private bookingWeekRepository: BookingWeekRepository) {}

  async sync(aggregate: WorkRequestAggregate, trx: TransactionCtx) {
    await this.bookingWeekRepository.removeAllByWorkRequestId(aggregate.id, trx);

    if (
      aggregate.workRequest.status !== WorkRequestStatus.Draft &&
      aggregate.bookings.length > 0
    ) {
      const weeks = this.getBookingWeeks(aggregate);
      await this.bookingWeekRepository.insertMany(weeks, trx);
    }
  }

  private getBookingWeeks(aggregate: WorkRequestAggregate) {
    return aggregate.bookings.map(booking => {
      const bookingWeek = BookingWeek.Create(
        booking,
        aggregate.getBookingGroupByBookingId(booking._id),
        aggregate.workRequest,
        aggregate.getBookingConsultant(booking._id),
        aggregate.customer,
        aggregate.getBookingProject(booking._id),
        aggregate.getBookingInvoices(booking._id)
      );

      const profit = this.profitCalculator.calculate(aggregate, booking._id);

      bookingWeek.profitNet = profit?.profitNet || null;
      bookingWeek.invoicedTotal = profit?.invoiceTotal;
      bookingWeek.profitRatio = profit?.profitRatio;

      return bookingWeek;
    });
  }
}
