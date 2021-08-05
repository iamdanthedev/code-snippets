import { ObjectID } from "bson";
import { FileRef } from "../../File";
import { UserRef } from "../../misc";
import { GqlNodeRef as NodeRef } from "../../Node";
import { Column, Entity } from "~/Domain/metadata";
import { IsDate, IsMongoId } from "class-validator";
import { AuditEntityNew, AuditItem } from "~/Domain/types";

@Entity()
export class BookingAccommodationConfirmation extends AuditEntityNew {
  static Create(
    documents: FileRef[],
    weeks: Date[],
    userRef: UserRef,
    accommodationRef?: NodeRef,
    offerId?: ObjectID
  ) {
    const item = new BookingAccommodationConfirmation();
    item.accommodationRef = accommodationRef;
    item.documents = documents;
    item.offerId = offerId;
    item.weeks = weeks;
    item.confirmedBy = userRef;
    item.confirmedOn = new Date();
    item.audit.push(AuditItem.MakeCreated(userRef));
    return item;
  }

  @Column()
  @IsMongoId()
  _id = new ObjectID();

  @Column()
  accommodationRef: NodeRef;

  @Column()
  documents: FileRef[];

  @Column()
  @IsMongoId()
  offerId: ObjectID;

  @Column()
  weeks: Date[];

  @Column()
  status: BookingAccommodationConfirmationStatus =
    BookingAccommodationConfirmationStatus.Confirmed;

  @Column()
  confirmedBy: UserRef;

  @Column()
  @IsDate()
  confirmedOn: Date;
}

export enum BookingAccommodationConfirmationStatus {
  Confirmed,
  Canceled
}
