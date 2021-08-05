import { ObjectID } from "bson";
import { compact } from "lodash";
import { CustomerRef, TimeReportKitStatusType } from "~/Domain/types";
import { Column, Entity, Subdoc } from "~/Domain/metadata";
import { CustomerUtils, normalizeSearchField } from "~/Domain/utils";

import { BookingAudit } from "./types/BookingAudit";
import { BookingWeekCachedInvoiceData } from "./types/BookingWeekCachedInvoiceData";
import { BookingWeekSearch } from "./types/BookingWeekSearch";
import { WorkRequestSearch } from "./types/WorkRequestSearch";

import { BaseBooking } from "./BaseBooking";
import { Booking } from "./Booking";
import { BookingGroup } from "./BookingGroup";
import { WorkRequest } from "./WorkRequest";
import { Consultant, ConsultantSearch } from "../Consultant";
import { Customer, CustomerSearch } from "../Customer/Customer";
import { Invoice } from "../Invoice";
import { Project } from "../Project";
import { TimeReportStatus, AccommodationTravelStatus } from "~/Shared/Enums";

@Entity()
export class BookingWeek extends BaseBooking {
  static Create(
    booking: Booking,
    bookingGroup: BookingGroup,
    workRequest: WorkRequest,
    consultant: Consultant,
    customer: Customer,
    project: Project,
    invoices: Invoice[]
  ) {
    if (!booking.bookingGroupId.equals(bookingGroup._id)) {
      throw new Error(`invalid booking group`);
    }

    const item = new BookingWeek(booking.week);

    const bookingInvoices = booking.customerInvoicing.invoiceNumbers.map(
      invoiceNumber => {
        const invoice = compact(invoices).find(x => x.InvoiceNumber === invoiceNumber);

        return invoice
          ? BookingWeekCachedInvoiceData.FromInvoice(invoice)
          : BookingWeekCachedInvoiceData.FromInvoiceNo(invoiceNumber);
      }
    );

    const invoicesValid =
      bookingInvoices.length === booking.customerInvoicing.invoiceNumbers.length;

    // base booking
    item.bookingGroupId = booking.bookingGroupId;
    item._areaOfExpertise = booking.areaOfExpertise;
    item.createdOn = booking.audit.find(x => x.type === "created")?.date || new Date();
    item._consultantRef = booking.consultantRef;
    item._costCenter = booking.costCenter;
    item._customerNumber = booking.customerNumber;
    item._customerInvoicing = booking.customerInvoicing;
    item._projectRef = booking.projectRef;
    item.accommodationOk = booking.accommodationOk;
    item.additionalWork = booking.additionalWork;
    item.additionalWorkNote = booking.additionalWorkNote;
    item.bookingAudit = booking.bookingAudit;
    item.canceled = booking.canceled;
    item.consultantSnapshot = booking.consultantSnapshot;
    item.contractOptions = booking.contractOptions;
    item.contractType = booking.contractType;
    item._customerFine = booking.customerFine;
    item.note = booking.note;
    item.travelOk = booking.travelOk;
    item._costs = booking.costs;

    // own fields
    item._id = new ObjectID();
    item.bookingAudit = booking.bookingAudit;
    item.bookingId = booking._id;
    item.consultantSearch = consultant.search;
    item.contractIn = bookingGroup.contractIn;
    item.contractOut = bookingGroup.contractOut;
    item.customerSearch = customer.Search;
    item.departmentsRefs = workRequest.workplace.departmentRefs;
    item.hospitalRef = workRequest.workplace.customerRef;
    item.invoices = bookingInvoices;
    item.invoicesValid = invoicesValid;
    item.organizationRef = CustomerUtils.GetOrgRef(customer);
    item.search = this.GetSearch(booking, workRequest, consultant, project);
    item.timeReportStatus = booking.timeReportStatus;
    item.workRequestId = workRequest._id;
    item.workRequestSearch = workRequest.search;

    item.accommodationStatus = workRequest.getBookingAccommodationStatus(booking._id);
    item.accommodationAudit = workRequest.getBookingAccommodationAudit(booking._id);
    item.travelStatus = workRequest.getBookingTravelStatus(booking._id);
    item.travelAudit = workRequest.getBookingTravelAudit(booking._id);

    return item;
  }

  static GetSearch(
    booking: Booking,
    workRequest: WorkRequest,
    consultant: Consultant,
    project: Project
  ): BookingWeekSearch {
    const search = new BookingWeekSearch();

    search.invoiceNumbers = booking.customerInvoicing.invoiceNumbers;

    search.searchField = [
      normalizeSearchField(
        ...(booking.customerInvoicing.invoiceNumbers || []),
        ...(workRequest.workplace.departmentRefs || []).map(x => x.Name),
        workRequest.workplace.customerRef && workRequest.workplace.customerRef.Name
      ),
      consultant.search.SearchField,
      workRequest.customerSearch.SearchField[0]
    ].join("|");

    search.project = normalizeSearchField(project?.Name, project?.ProjectNumber);

    search.projectMembers = [
      project?.Admin?.PersonId,
      project?.Owner?.PersonId,
      ...(project?.Members?.map(x => x.PersonId) ?? [])
    ].compact();

    return search;
  }

  @Column()
  _id: ObjectID;

  @Column()
  contractOut: boolean;

  @Column()
  contractIn: boolean;

  @Column()
  createdOn: Date;

  @Column()
  bookingId: ObjectID;

  @Subdoc(() => CustomerRef)
  organizationRef: CustomerRef; // Root org or "Region" in older terms

  @Subdoc(() => CustomerRef)
  hospitalRef: CustomerRef; // this is not always a hospital

  @Subdoc(() => [CustomerRef])
  departmentsRefs: CustomerRef[];

  @Column()
  workRequestId: ObjectID;

  @Subdoc(() => BookingAudit)
  bookingAudit: BookingAudit;

  @Column()
  timeReportStatus: TimeReportStatus | TimeReportKitStatusType | null;

  @Column()
  search: BookingWeekSearch;

  @Column()
  consultantSearch: ConsultantSearch;

  @Column()
  customerSearch: CustomerSearch;

  @Column()
  workRequestSearch: WorkRequestSearch;

  @Column()
  invoices: BookingWeekCachedInvoiceData[];

  @Column()
  invoicesValid: boolean; // false means the data in Invoices is probably incomplete

  /**
   * total profit on the booking
   * null means the number unknown
   */
  @Column()
  profitNet: number | null = null;

  /**
   * total income on the booking
   * null means the number unknown
   */
  @Column()
  invoicedTotal: number | null = null;

  /**
   * booking profit / booking income
   * null means the number unknown
   */
  @Column()
  profitRatio: number | null = null;

  @Column()
  accommodationStatus: AccommodationTravelStatus;

  @Column()
  travelStatus: AccommodationTravelStatus;
}
