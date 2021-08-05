import { IsDate, IsString } from "class-validator";
import { Column, Entity } from "~/Domain/metadata";
import { UserRef } from "~/Domain/ref";

@Entity()
export class BookingCancellation {
  @Column()
  @IsString()
  readonly reason: string;

  @Column()
  @IsDate()
  readonly date: Date;

  @Column()
  readonly userRef: UserRef;

  constructor(reason: string, date: Date, userRef: UserRef) {
    this.reason = reason;
    this.date = date;
    this.userRef = userRef;
  }
}
