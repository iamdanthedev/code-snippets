import { ObjectID } from "bson";
import { FileRef } from "../../File";
import { UserRef } from "../../misc";
import { Column, Entity } from "~/Domain/metadata";
import { IsDate, IsMongoId } from "class-validator";
import { AuditEntityNew, AuditItem } from "~/Domain/types";

@Entity()
export class BookingTravelConfirmation extends AuditEntityNew {
  static Create(confirmedBy: UserRef, weeks: Date[], documents: FileRef[]) {
    const item = new BookingTravelConfirmation();
    item.documents = documents;
    item.weeks = weeks;
    item.confirmedBy = confirmedBy;
    item.confirmedOn = new Date();
    item.audit.push(AuditItem.MakeCreated(confirmedBy));
    return item;
  }
  @Column()
  @IsMongoId()
  _id = new ObjectID();

  @Column()
  weeks: Date[];

  @Column()
  documents: FileRef[];

  @Column()
  confirmedBy: UserRef;

  @Column()
  @IsDate()
  confirmedOn: Date;
}
