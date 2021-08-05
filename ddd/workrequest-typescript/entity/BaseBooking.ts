import { ObjectID } from "bson";
import { IsBoolean, IsEnum, IsMongoId, IsString, ValidateNested } from "class-validator";
import { Column, Entity, Subdoc } from "~/Domain/metadata";
import { ConsultantRef, FileRef, NodeRef } from "~/Domain/ref";
import { BookingAudit } from "./types/BookingAudit";
import { BookingCancellation } from "./types/BookingCancellation";
import { BookingCosts } from "./types/BookingCosts";
import { BookingConsultantSnapshot } from "./types/BookingConsultantSnapshot";
import { BookingContractOption } from "./types/BookingContractOption";
import { BookingCustomerInvoicing } from "./types/BookingCustomerInvoicing";
import { ContractType } from "../Contract";
import { CostCenter } from "../CostCenter";
import { Document } from "../Document";
import { AccommodationTravelAudit } from "~/Domain/types/workrequests/types/AccommodationTravelAudit";
import { UserRef } from "~/Domain/types";

export interface BaseBookingParams {
  accommodationRequired: boolean;
  travelRequired: boolean;
  areaOfExpertise: string;
  bookingGroupId: ObjectID;
  contractType: ContractType;
  consultantSnapshot: BookingConsultantSnapshot;
  costCenter: CostCenter;
  consultantRef: ConsultantRef;
  customerNumber: string;
  projectRef: NodeRef;
  week: Date;
}

@Entity()
export class BaseBooking {
  static SetBaseParams(booking: BaseBooking, params: BaseBookingParams) {
    booking._areaOfExpertise = params.areaOfExpertise;
    booking.accommodationRequired = params.accommodationRequired;
    booking.travelRequired = params.travelRequired;
    booking.bookingGroupId = params.bookingGroupId;
    booking.contractType = params.contractType;
    booking.consultantSnapshot = params.consultantSnapshot;
    booking._customerNumber = params.customerNumber;
    booking._costCenter = params.costCenter;
    booking._consultantRef = params.consultantRef;
    booking._projectRef = params.projectRef;
  }

  protected constructor(week: Date) {
    this.week = week;
  }

  @Column()
  @IsMongoId()
  bookingGroupId: ObjectID;

  @Subdoc(() => [BookingContractOption])
  @ValidateNested({ each: true })
  contractOptions: BookingContractOption[] = [];

  @Column({ expose: "contractType" })
  @IsEnum(ContractType)
  contractType: ContractType | null;

  @Column()
  @IsString()
  note = "";

  @Column()
  @IsBoolean()
  additionalWork = false;

  @Column()
  @IsString()
  additionalWorkNote = "";

  @Subdoc(() => BookingAudit)
  @ValidateNested()
  bookingAudit: BookingAudit | null = null;

  @Column()
  @IsBoolean()
  travelOk = false;

  @Column()
  @IsBoolean()
  accommodationOk = false;

  @Column()
  @IsBoolean()
  accommodationRequired: boolean;

  @Column()
  @IsBoolean()
  travelRequired: boolean;

  @Subdoc(() => AccommodationTravelAudit)
  travelAudit: AccommodationTravelAudit | null = null;

  @Subdoc(() => AccommodationTravelAudit)
  accommodationAudit: AccommodationTravelAudit | null = null;

  @Subdoc(() => BookingCancellation)
  @ValidateNested()
  canceled: BookingCancellation | null = null;

  @Subdoc(() => BookingConsultantSnapshot)
  @ValidateNested()
  consultantSnapshot: BookingConsultantSnapshot;

  @Column()
  readonly week: Date;

  @Column({ expose: "costCenter" })
  @ValidateNested()
  protected _costCenter: CostCenter;

  @Column({ expose: "areaOfExpertise" })
  @IsString()
  protected _areaOfExpertise: string;

  @Column({ expose: "consultantRef" })
  @ValidateNested()
  protected _consultantRef: ConsultantRef;

  @Subdoc(() => BookingCosts, { expose: "costs" })
  @ValidateNested()
  protected _costs: BookingCosts | null;

  @Subdoc(() => BookingCustomerInvoicing, { expose: "customerInvoicing" })
  protected _customerInvoicing = new BookingCustomerInvoicing();

  @Column({ expose: "customerFine" })
  protected _customerFine = 0;

  @Column({ expose: "customerNumber" })
  @IsString()
  protected _customerNumber = "";

  @Column({ expose: "projectRef" })
  @ValidateNested()
  protected _projectRef: NodeRef;

  @Column({ expose: "subcontractorDocuments" })
  protected _subcontractorDocuments: Document[] = [];

  get areaOfExpertise() {
    return this._areaOfExpertise;
  }

  get consultantId() {
    return this._consultantRef?.NodeID;
  }

  get customerNumber() {
    return this._customerNumber;
  }

  get customerFine() {
    return this._customerFine;
  }

  get consultantRef() {
    return this._consultantRef;
  }

  get costCenter() {
    return this._costCenter;
  }

  get costCenterId() {
    return this._costCenter?.id || "";
  }

  get costs() {
    return this._costs;
  }

  @Column()
  get isConsultantPayed() {
    return !!this.costs;
  }

  @Column()
  get isCustomerBilled() {
    return !!this.customerInvoicing?.isBilled;
  }

  get projectRef() {
    return this._projectRef;
  }

  get projectId() {
    return this._projectRef?.NodeID;
  }

  // customer invoice

  get customerInvoicing() {
    return this._customerInvoicing;
  }

  // subcontractor documents

  get subcontractorDocuments() {
    return this._subcontractorDocuments || [];
  }

  getSubcontractorDocument(fileId: ObjectID) {
    return this._subcontractorDocuments.find(x => x.FileRef.NodeID.equals(fileId));
  }

  addSubcontractorDocument(fileRef: FileRef) {
    if (this.getSubcontractorDocument(fileRef.NodeID)) {
      throw new Error("document already exists");
    }

    this._subcontractorDocuments.push({ FileRef: fileRef });
  }

  removeSubcontractorDocument(fileId: ObjectID) {
    if (!this.getSubcontractorDocument(fileId)) {
      throw new Error("document doesn't exist");
    }

    this._subcontractorDocuments.remove(x => x.FileRef.NodeID.equals(fileId));
  }

  setTravelAudit(isApproved: boolean, userRef: UserRef) {
    this.travelAudit = new AccommodationTravelAudit(isApproved, userRef);
  }

  setAccommodationAudit(isApproved: boolean, userRef: UserRef) {
    this.accommodationAudit = new AccommodationTravelAudit(isApproved, userRef);
  }
}
