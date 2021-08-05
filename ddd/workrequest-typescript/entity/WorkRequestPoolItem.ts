import { ObjectID } from "bson";
import { Column, Entity } from "~/Domain/metadata";
import { FileRef, NodeRef, UserRef } from "~/Domain/ref";
import { BookingContractOption } from "./types/BookingContractOption";
import { WorkRequestContract } from "./types/WorkRequestContract";

export enum ConfirmationStatus {
  Accepted = "Accepted",
  AcceptedWithModification = "AcceptedWithModification",
  Rejected = "Rejected"
}

export enum SendWRInformationMethod {
  Email = "Email",
  SMS = "SMS"
}

export class WorkRequestInformationSent {
  sentBy: UserRef;
  sentOn: Date;
  fileRef?: FileRef;
  sentThrough?: SendWRInformationMethod;
}

export class WorkRequestPoolItemConfirmation {
  status: ConfirmationStatus;
  confirmedOn: Date;
  comment: string;
}

@Entity()
export class WorkRequestPoolItem {
  @Column()
  _id: ObjectID;

  @Column()
  addedBy: UserRef;

  @Column()
  addedOn: Date;

  @Column()
  consultantRef: NodeRef;

  @Column()
  contract: WorkRequestContract | null;

  @Column()
  draftBookingContractOptions: BookingContractOption[];

  @Column()
  draftContractOptionsEditMode?: boolean;

  @Column()
  informationSent: WorkRequestInformationSent | null;

  @Column()
  presentationSentToCustomer: WorkRequestInformationSent | null;

  @Column()
  customerConfirmation: WorkRequestPoolItemConfirmation | null;

  @Column()
  consultantConfirmation: WorkRequestPoolItemConfirmation | null;

  @Column()
  consultantAvailablePeriods: Duration[];
}
