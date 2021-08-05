import { ObjectID } from "bson";
import { Column, Entity, Subdoc } from "~/Domain/metadata";
import { BookingAccommodationConfirmation } from "./types/BookingAccommodationConfirmation";
import { BookingTravelConfirmation } from "./types/BookingTravelConfirmation";
import { IsMongoId } from "class-validator";
import { AuditItem } from "~/Domain/types";
import { UserRef } from "~/Domain/ref";
import { InvalidUserInputError } from "~/common/errors";

@Entity()
export class BookingGroup {
  static Create() {
    return new BookingGroup();
  }

  constructor() {}

  @Column()
  @IsMongoId()
  _id: ObjectID = new ObjectID();

  @Column()
  contractOut = false; // contract sent to consultant to sign

  @Column()
  contractIn = false; // signed contract return by consultant

  @Subdoc(() => [BookingAccommodationConfirmation], {
    expose: "accommodationConfirmations"
  })
  private _accommodationConfirmations: BookingAccommodationConfirmation[] = [];

  @Subdoc(() => [BookingTravelConfirmation], {
    expose: "travelConfirmations"
  })
  private _travelConfirmations: BookingTravelConfirmation[] = [];

  get accommodationConfirmations() {
    return this._accommodationConfirmations || [];
  }

  get travelConfirmations() {
    return this._travelConfirmations || [];
  }

  addAccommodationConfirmation(confirmation: BookingAccommodationConfirmation) {
    this._accommodationConfirmations
      ? this._accommodationConfirmations.push(confirmation)
      : (this._accommodationConfirmations = [confirmation]);
  }

  addTravelConfirmation(confirmation: BookingTravelConfirmation) {
    this._travelConfirmations
      ? this._travelConfirmations.push(confirmation)
      : (this._travelConfirmations = [confirmation]);
  }

  getAccommodationConfirmationById(confirmationId: ObjectID) {
    return this.accommodationConfirmations.find(x => x._id.equals(confirmationId));
  }

  getAccommodationConfirmationByWeek(bookingWeek: Date) {
    return this.accommodationConfirmations.filter(x => {
      return !x.deleted && x.weeks.any(week => bookingWeek.valueOf() === week.valueOf());
    });
  }

  getTravelConfirmationById(confirmationId: ObjectID) {
    return this.travelConfirmations.find(x => x._id.equals(confirmationId));
  }

  getTravelConfirmationByWeek(bookingWeek: Date) {
    return this.travelConfirmations.filter(x => {
      return !x.deleted && x.weeks.any(week => bookingWeek.valueOf() === week.valueOf());
    });
  }

  toggleAccommodationConfirmation(confirmationId: ObjectID, userRef: UserRef): boolean {
    const item = this.getAccommodationConfirmationById(confirmationId);
    if (!item) {
      throw new InvalidUserInputError(
        `can't find Accommodation Confirmation with this ID ${confirmationId}`
      );
    }
    const deleted = !item.deleted;
    const newAuditItem = deleted
      ? AuditItem.MakeDeleted(userRef)
      : AuditItem.MakeRestored(userRef);
    item.deleted = deleted;
    item.audit = item.audit ? [...item.audit, newAuditItem] : [newAuditItem];
    return deleted;
  }

  toggleTravelConfirmation(confirmationId: ObjectID, userRef: UserRef): boolean {
    const item = this.getTravelConfirmationById(confirmationId);
    if (!item) {
      throw new InvalidUserInputError(
        `can't find Travel Confirmation with this ID ${confirmationId}`
      );
    }
    const deleted = !item.deleted;
    const newAuditItem = deleted
      ? AuditItem.MakeDeleted(userRef)
      : AuditItem.MakeRestored(userRef);
    item.deleted = deleted;
    item.audit = item.audit ? [...item.audit, newAuditItem] : [newAuditItem];
    return deleted;
  }
}
