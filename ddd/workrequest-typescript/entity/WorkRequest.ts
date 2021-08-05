import moment from "moment";
import { ObjectID } from "bson";
import { IsArray } from "class-validator";
import { isEmpty } from "lodash";
import { Column, Entity, Init, Subdoc } from "~/Domain/metadata";
import { Booking } from "./Booking";
import { BookingEvent } from "../EventLog/BookingEvent";
import { WorkRequestEvent } from "../EventLog/WorkRequestEvent";
import { BookingGroup } from "./BookingGroup";
import { AuditEntityNew, AuditItem } from "../AuditBase";
import { CustomerSearch } from "../Customer/Customer";
import { Workplace } from "./types/Workplace";
import { WorkRequestApplication } from "./types/WorkRequestApplication";
import { WorkRequestDuration } from "./types/WorkRequestDuration";
import { WorkRequestEmailBasis } from "./types/WorkRequestBasis";
import { WorkRequestPoolItem } from "./WorkRequestPoolItem";
import { WorkRequestSearch } from "./types/WorkRequestSearch";
import { WorkRequestWeekParam } from "./types/WorkRequestWeekParam";
import { Document } from "../Document";
import { UserRef } from "../misc";
import {
  AccommodationTravelStatus,
  WorkRequestDurationType,
  WorkRequestsSortBy,
  WorkRequestStatus,
  WorkRequestTags
} from "~/Shared/Enums";
import { AccommodationTravelAudit } from "./types/AccommodationTravelAudit";
import {
  BookingAccommodationConfirmation,
  BookingTravelConfirmation,
  BookingWeekDocumentTypes
} from "~/Domain/types";
import { WorkRequestEvents } from "~/Domain/types/workrequests/WorkRequestEvents/WorkRequestEvents";

export {
  WorkRequestStatus,
  WorkRequestsSortBy,
  AccommodationTravelStatus,
  WorkRequestTags,
  WorkRequestDurationType
};

export interface CreateWorkRequestParams {
  areaOfExpertise: string;
  customerSearch: CustomerSearch;
  workplace: Workplace;
  isDirect: boolean;
}

@Entity()
export class WorkRequest extends AuditEntityNew {
  public wrEventLog: WorkRequestEvents;

  static Create(params: CreateWorkRequestParams) {
    const item = new WorkRequest();
    item.areaOfExpertise = params.areaOfExpertise;
    item.customerSearch = params.customerSearch;
    item.isDirect = params.isDirect;
    item.publishedOn = new Date();
    item._workplace = params.workplace;
    return item;
  }

  constructor() {
    super();
  }

  @Init()
  init() {
    //trick if field not exists
    this._wrEventLog = this._wrEventLog ?? [];
    this.wrEventLog = new WorkRequestEvents(() => this._wrEventLog);
  }

  @Column()
  _id: ObjectID = new ObjectID();

  @Column()
  isPriority = false;

  @Column()
  applications: WorkRequestApplication[] = [];

  @Column()
  areaOfExpertise: string;

  @Subdoc(() => WorkRequestEmailBasis)
  basis: WorkRequestEmailBasis | null = null;

  @Subdoc(() => [Booking])
  bookings: Booking[] = [];

  @Subdoc(() => [WorkRequestEvent.BaseWorkRequestEvent], { expose: "wrEventLog" })
  @IsArray()
  private _wrEventLog: WorkRequestEvent.BaseWorkRequestEvent[] = [];
  @Subdoc(() => [BookingGroup])
  bookingGroups: BookingGroup[] = [];

  @Column()
  consultantPool: WorkRequestPoolItem[] = [];

  @Column()
  description = "";

  @Column()
  schedule = "";

  @Column()
  qualifications = "";

  @Column()
  documents: Document[] = [];

  @Column()
  duration: WorkRequestDuration[] = [];

  @Column()
  durationCustomText = "";

  @Column()
  isDirect: boolean;

  @Column()
  lastApplicationDate: Date | null | "ASAP" = null;

  @Column()
  specializations: string[] = [];

  @Column()
  showInApp = false;

  @Column()
  status: WorkRequestStatus = WorkRequestStatus.Draft;

  @Column()
  workRequestTags: WorkRequestTags[] = [];

  @Column()
  receivedOn: Date | null = null;

  @Column()
  publishedOn: Date | null = null;

  @Column()
  search: WorkRequestSearch = null;

  @Column()
  customerSearch: CustomerSearch = null;

  @Column()
  workRequestNumber: string | null = null;

  @Subdoc(() => [WorkRequestWeekParam])
  vacanciesByWeeks: WorkRequestWeekParam[] = [];

  @Column({ expose: "durationType" })
  private _durationType: WorkRequestDurationType;

  @Subdoc(() => [BookingEvent.BaseBookingEvent], { expose: "eventLog" })
  @IsArray()
  private _eventLog: BookingEvent.BaseBookingEvent[] = [];

  @Subdoc(() => Workplace, { expose: "workplace" })
  private _workplace: Workplace;

  get allProjectIds() {
    return this.bookings
      .map(x => x.projectId)
      .compact()
      .uniqueBy(x => x.toHexString());
  }

  get consultantIds() {
    return this.bookings
      .map(x => x.consultantId)
      .compact()
      .uniqueBy(x => x.toHexString());
  }

  get customerId() {
    return this._workplace?.customerRef?.Id;
  }

  get invoiceNumbers() {
    return this.bookings.flatMap(x => x.customerInvoicing.invoiceNumbers).unique();
  }

  get durationType(): WorkRequestDurationType | null {
    return (
      this._durationType ||
      (!isEmpty(this.duration) ? WorkRequestDurationType.Exact : null)
    );
  }

  set durationType(v: WorkRequestDurationType) {
    this._durationType = v;
  }

  get workplace() {
    return this._workplace;
  }

  getBookingGroup(id: ObjectID) {
    return this.bookingGroups.find(x => x._id.equals(id));
  }

  getBookingInBookingGroupOnWeek(bookingGroupId: ObjectID, week: Date) {
    if (!this.getBookingGroup(bookingGroupId)) {
      throw new Error("booking group not found");
    }

    return this.bookings.find(
      x => x.bookingGroupId.equals(bookingGroupId) && x.week.valueOf() === week.valueOf()
    );
  }

  getBookingsInBookingGroup(bookingGroupId: ObjectID) {
    if (!this.getBookingGroup(bookingGroupId)) {
      throw new Error("booking group not found");
    }

    return this.bookings.filter(x => x.bookingGroupId.equals(bookingGroupId));
  }

  getConsultantBookings(consultantId: ObjectID) {
    return this.bookings.filter(x => x.consultantId.equals(consultantId));
  }

  setWorkplace(workplace: Workplace) {
    this._workplace = workplace;
  }

  getStartDate() {
    return this.duration.map(x => x.from).sortBy(x => x)[0] || null;
  }

  getEndDate() {
    return this.duration.map(x => x.to).sortBy(x => -x)[0] || null;
  }

  // Event Log by booking
  // TODO refactor

  get events(): ReadonlyArray<BookingEvent.BaseBookingEvent> {
    return this._eventLog.filter(x => !x.deleted);
  }

  eventById(eventId: ObjectID): BookingEvent.BaseBookingEvent {
    return this.events.find(x => x._id.equals(eventId));
  }

  eventsByBookingId(bookingId: ObjectID): ReadonlyArray<BookingEvent.BaseBookingEvent> {
    return this.events.filter(x => x.bookingId.equals(bookingId));
  }

  hasEventLog(eventLogId: ObjectID) {
    return this._eventLog.any((x: BookingEvent.BaseBookingEvent) =>
      x._id.equals(eventLogId)
    );
  }

  addEventLog(eventLog: BookingEvent.BaseBookingEvent) {
    if (!this.hasEventLog(eventLog._id)) {
      this._eventLog.push(eventLog);
    }
  }

  updateEventLog(eventLog: BookingEvent.BaseBookingEvent, userRef: UserRef) {
    if (this.hasEventLog(eventLog._id)) {
      const existingId = this._eventLog.findIndex(x => x._id.equals(eventLog._id));

      this._eventLog[existingId].audit.push(AuditItem.MakeUpdated(userRef));
      this._eventLog[existingId].sticky = eventLog.sticky;
      this._eventLog[existingId].description = eventLog.description;
    }
  }

  removeEventLog(eventLogId: ObjectID, userRef: UserRef) {
    if (this.hasEventLog(eventLogId)) {
      const existingId = this._eventLog.findIndex(x => x._id.equals(eventLogId));
      this._eventLog[existingId].deleted = true;
      this._eventLog[existingId].audit.push(AuditItem.MakeDeleted(userRef));
    }
  }

  getBooking(bookingId: ObjectID): Booking {
    return this.bookings.find(x => x._id.equals(bookingId));
  }

  checkStatus(
    bookingId: ObjectID,
    required: boolean,
    approved: boolean,
    hasDoc: boolean
  ): AccommodationTravelStatus {
    if (!required && required !== undefined) {
      return AccommodationTravelStatus.NotRequired;
    }

    if (required && approved && !hasDoc) {
      return AccommodationTravelStatus.ApprovedManually;
    }

    if (required && approved && hasDoc) {
      return AccommodationTravelStatus.Confirmed;
    }

    return AccommodationTravelStatus.Required;
  }

  getBookingAccommodationStatus(bookingId: ObjectID): AccommodationTravelStatus {
    const booking = this.getBooking(bookingId);
    const {
      accommodationRequired: required,
      accommodationAudit,
      bookingGroupId,
      week: bookingWeek
    } = booking;

    const { accommodationConfirmations: confirmations } = this.getBookingGroup(
      bookingGroupId
    );

    // true if there is at least one document
    const hasConfirmation =
      confirmations?.filter(
        x => !x.deleted && x.weeks.any(week => week.valueOf() === bookingWeek.valueOf())
      )?.length > 0;

    return this.checkStatus(
      bookingId,
      required,
      accommodationAudit?.approved,
      hasConfirmation
    );
  }

  getBookingAccommodationAudit(bookingId: ObjectID): AccommodationTravelAudit {
    const booking = this.getBooking(bookingId);
    return booking.accommodationAudit;
  }

  getBookingTravelStatus(bookingId: ObjectID): AccommodationTravelStatus {
    const booking = this.getBooking(bookingId);

    const {
      travelRequired: required,
      travelAudit,
      bookingGroupId,
      week: bookingWeek
    } = booking;

    const { travelConfirmations: confirmations } = this.getBookingGroup(bookingGroupId);

    // true if there is at least one document
    const hasConfirmation =
      confirmations?.filter(
        x => !x.deleted && x.weeks.any(week => week.valueOf() === bookingWeek.valueOf())
      )?.length > 0;

    return this.checkStatus(bookingId, required, travelAudit?.approved, hasConfirmation);
  }

  getBookingTravelAudit(bookingId: ObjectID): AccommodationTravelAudit {
    const booking = this.getBooking(bookingId);
    return booking.travelAudit;
  }

  hasDocument(id: ObjectID): boolean {
    return this.documents.any(x => x.FileRef.NodeID.equals(id));
  }

  addDocument(doc: Document) {
    if (this.hasDocument(doc.FileRef.NodeID)) {
      return;
    }
    this.documents.push(doc);
  }

  removeDocument(fileId: ObjectID) {
    if (this.hasDocument(fileId)) {
      this.documents = this.documents.filter(x => !x.FileRef.NodeID.equals(fileId));
    }
  }

  setDocuments(docs: Document[]) {
    this.documents = docs;
  }

  async getDocsByBookingId(bookingId: ObjectID) {
    const {
      bookingGroupId,
      week: bookingWeek,
      documents,
      subcontractorDocuments
    } = this.getBooking(bookingId);

    const { accommodationConfirmations, travelConfirmations } = this.getBookingGroup(
      bookingGroupId
    );

    const accDocs = this.filterConfirmationDocsByWeek(
      accommodationConfirmations,
      bookingWeek,
      BookingWeekDocumentTypes.AccommodationConfirmations
    );
    const travelDocs = this.filterConfirmationDocsByWeek(
      travelConfirmations,
      bookingWeek,
      BookingWeekDocumentTypes.TravelConfirmation
    );

    const subContractorDocumentsWithType = subcontractorDocuments?.map(f => ({
      fileRef: f.FileRef,
      documentType: BookingWeekDocumentTypes.SubcontractorInvoices
    }));

    return [
      ...documents.all,
      ...accDocs,
      ...travelDocs,
      ...subContractorDocumentsWithType
    ];
  }

  async getDocsForBookingTimeReportKit(bookingId: ObjectID) {
    const { timeReportTypeSentToHBA } = this.getBooking(bookingId);

    const docs = await this.getDocsByBookingId(bookingId);

    return {
      templateType: timeReportTypeSentToHBA,
      docs
    };
  }

  private filterConfirmationDocsByWeek(
    items: BookingTravelConfirmation[] | BookingAccommodationConfirmation[],
    bookingWeek: Date,
    type: BookingWeekDocumentTypes
  ) {
    return items
      ?.filter(
        x => !x.deleted && x.weeks.any(week => week.valueOf() === bookingWeek.valueOf())
      )
      .flatMap(c => c.documents)
      .map(f => ({ fileRef: f, documentType: type }));
  }
}
