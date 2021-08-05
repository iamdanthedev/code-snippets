import { UserRef } from "../../misc";
import { Column, Entity } from "~/Domain/metadata";
import { IsBoolean, IsDate } from "class-validator";

// bookingAccommodationStatus =
//   isBookingRequired * [accommodation/travel]Audit * [accommodation/travel]Confirmation (via booking group)

@Entity()
export class AccommodationTravelAudit {
  constructor(approved: boolean, setBy: UserRef) {
    this.approved = !!approved;
    this.setBy = setBy;
  }

  @Column()
  @IsBoolean()
  approved: boolean;

  @Column()
  @IsDate()
  setOn: Date = new Date();

  @Column()
  @IsDate()
  setBy: UserRef;

  updateOnlyUserInfo(userRef: UserRef) {
    this.setOn = new Date();
    this.setBy = userRef;
  }

  syncOldBooking() {
    this.approved = true;
  }
}
