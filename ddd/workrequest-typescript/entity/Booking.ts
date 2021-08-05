import { ObjectID } from "bson";
import { IsMongoId, ValidateNested } from "class-validator";
import { Column, Entity, Init, Subdoc } from "~/Domain/metadata";
import { ConsultantRef, NodeRef } from "~/Domain/ref";
import * as assert from "~/Domain/utils/assert";
import { AuditItem } from "../AuditBase";
import { BookingInvoiceFormData } from "../BookingInvoiceForm";
import { TimeReport, TimeReportStatus } from "./TimeReport";
import { BookingCancellation } from "./types/BookingCancellation";
import {
  BookingCosts,
  EmployeeBookingCosts,
  SubcontractorBookingCosts
} from "./types/BookingCosts";
import { Project } from "../Project";
import { CostCenter } from "../CostCenter";
import { LegalPersonType, UserRef } from "../misc";
import { BaseBooking, BaseBookingParams } from "./BaseBooking";
import { AccommodationRequest } from "./types/AccommodationRequest";
import { TravelRequest } from "./types/TravelRequest";
import { BookingDocument } from "./types/BookingDocument";
import { BookingDocuments } from "./BookingDocuments/BookingDocuments";
import {
  TimeReportKit,
  TimeReportKitStatus,
  TimeReportKitStatusType
} from "./types/TimeReportKit";
import { TimeReportTemplateType } from "~/Domain/types";
import { TimeReportKits } from "./TimeReportKits/TimeReportKits";

export interface CreateBookingParams extends BaseBookingParams {
  createdBy: UserRef;
  week: Date;
}

@Entity()
export class Booking extends BaseBooking {
  public documents: BookingDocuments;
  public timeReportKit: TimeReportKits;

  @Column()
  @IsMongoId()
  _id = new ObjectID();

  @Subdoc(() => [AuditItem])
  @ValidateNested({ each: true })
  audit: AuditItem[] = [];

  @Column()
  invoiceForm: BookingInvoiceFormData | null = null;

  @Column()
  timeReportStatus: TimeReportStatus | TimeReportKitStatusType | null;

  @Column()
  timeReportStatusSetBy: UserRef | null;

  @Column()
  timeReportTypeSentToHBA: TimeReportTemplateType = null;

  @Subdoc(() => [TimeReportKit], { expose: "timeReportKit" })
  private _timeReportKit: TimeReportKit[] | [];

  private _isOpen = true;

  /**
   * @deprecated looks like we don't need it anymore
   */
  @Subdoc(() => TimeReport, { expose: "timeReport" })
  private _timeReport: TimeReport | null = null;

  @Subdoc(() => [AccommodationRequest], { expose: "accommodationRequests" })
  private _accommodationRequests: AccommodationRequest[] = [];

  @Subdoc(() => [TravelRequest], { expose: "travelRequests" })
  private _travelRequests: TravelRequest[] = [];

  @Column({ expose: "documents" })
  @ValidateNested()
  private _documents: BookingDocument[] = [];

  static Create(params: CreateBookingParams) {
    const booking = new Booking(params.week);
    BaseBooking.SetBaseParams(booking, params);
    booking.audit.push(AuditItem.MakeCreated(params.createdBy));
    return booking;
  }

  constructor(week: Date) {
    super(week);
    this.init();
  }

  @Init()
  init() {
    this._isOpen = !this.isConsultantPayed && !this.isCustomerBilled;

    //trick if field not exists
    this._documents = this._documents ?? [];
    this.documents = new BookingDocuments(() => this._documents);

    this._timeReportKit = this._timeReportKit
      ? Array.isArray(this._timeReportKit)
        ? this._timeReportKit
        : [this._timeReportKit]
      : [];
    this.timeReportKit = new TimeReportKits(() => this._timeReportKit);
  }

  get isCanceled() {
    return !!this.canceled;
  }

  get isOpen() {
    return this._isOpen;
  }

  get isCancellable() {
    return (
      this._isOpen &&
      !this.isCanceled &&
      (this.timeReportStatus === TimeReportStatus.Blank || this.timeReportStatus === null)
    );
  }

  cancellableReason(): string {
    if (!this._isOpen) {
      return "Denna veckan kan inte avbokas då den är hanterad av ekonomiavdelningen.";
    } else if (
      this.timeReportStatus != TimeReportStatus.Blank &&
      this.timeReportStatus != null
    ) {
      return "Denna veckan kan inte avbokas då det finns en påbörjad tidrapport. Radera tiderna på tidrapporten för att avboka veckan.";
    }

    return "";
  }

  get hasInvoiceForm() {
    return !!this.invoiceForm;
  }

  get accommodationRequests() {
    return this._accommodationRequests || [];
  }

  get travelRequests() {
    return this._travelRequests || [];
  }

  setApproveKitTR(id: ObjectID, approved: boolean) {
    const kit = this.timeReportKit.getById(id);
    if (kit) {
      kit.approved = approved;
      this.timeReportKit.update(kit);
    } else {
      throw new Error("Booking hasn't Kit");
    }
  }

  setKitStatus(id: ObjectID, status: TimeReportKitStatus, approved?: boolean) {
    const kit = this.timeReportKit.getById(id);
    if (kit.statuses?.length > 0) {
      kit.statuses.push(status);
    } else {
      kit.statuses = [status];
    }

    // Set total kits status
    this.timeReportStatus = this.timeReportKit.status;
    this.timeReportStatusSetBy = status.setBy;

    if (approved !== undefined) {
      kit.approved = approved;
    }

    // this.timeReportKit.update(kit);
  }

  addTravelRequest(request: TravelRequest) {
    assert.UserRef(request.sentBy);
    assert.Date(request.sentOn);

    this._travelRequests = this._travelRequests || [];
    this._travelRequests.push(request);
  }

  addAccommodationRequest(request: AccommodationRequest) {
    assert.UserRef(request.sentBy);
    assert.Date(request.sentOn);

    this._accommodationRequests = this._accommodationRequests || [];
    this._accommodationRequests.push(request);
  }

  setAreaOfExpertise(value: string) {
    this.assertIsOpen();
    this._areaOfExpertise = value;
  }

  setCostCenter(costCenter: CostCenter) {
    this.assertIsOpen();
    this._costCenter = costCenter;
  }

  setConsultantRef(consultantRef: ConsultantRef) {
    this.assertIsOpen();
    this._consultantRef = consultantRef;
  }

  setCustomerNumber(value: string) {
    this.assertIsOpen();
    this._customerNumber = value || "";
  }

  setCustomerFine(value: number) {
    assert.NonNegativeInt(value);
    this._customerFine = value;
  }

  setInvoiceForm(data: BookingInvoiceFormData) {
    this.invoiceForm = data;
  }

  setProject(project: Project) {
    this.assertIsOpen();
    this._projectRef = NodeRef.FromProject(project);
  }

  cancel(reason: string, userRef: UserRef) {
    assert.StringRequired(reason);
    assert.UserRef(userRef);

    if (this.isCanceled) {
      throw new Error(`Booking ${this._id} was canceled previously`);
    }

    this.canceled = new BookingCancellation(reason, new Date(), userRef);
    return this.canceled;
  }

  isInBookingGroup(bookingGroupId: ObjectID) {
    return this.bookingGroupId.equals(bookingGroupId);
  }

  clearBookingCosts() {
    this._costs = null;
  }

  setBookingCosts(costs: BookingCosts) {
    if (!costs) {
      throw new Error("missing costs");
    }

    if (
      this.consultantSnapshot?.legalPersonType === LegalPersonType.Employee &&
      !(costs instanceof EmployeeBookingCosts)
    ) {
      throw new Error("invalid booking costs");
    }

    if (
      this.consultantSnapshot?.legalPersonType === LegalPersonType.Subcontractor &&
      !(costs instanceof SubcontractorBookingCosts)
    ) {
      throw new Error("invalid booking costs");
    }

    this._costs = costs;
  }

  getEmployeeBookingCosts() {
    if (!this._costs) {
      return null;
    }

    if (this._costs instanceof EmployeeBookingCosts) {
      return this._costs;
    }

    throw new Error("invalid booking costs class");
  }

  getSubcontractorBookingCosts() {
    if (!this._costs) {
      return null;
    }

    if (this._costs instanceof SubcontractorBookingCosts) {
      return this._costs;
    }

    throw new Error("invalid booking costs class");
  }

  private assertIsOpen() {
    if (!this.isOpen) {
      throw new Error(`Booking is not open! Booking id ${this._id}`);
    }
  }
}
