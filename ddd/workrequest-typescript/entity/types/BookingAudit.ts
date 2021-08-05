import { IsBoolean, IsDate, IsString, ValidateNested } from "class-validator";
import { Column, Entity } from "~/Domain/metadata";
import { UserRef } from "../../misc";

@Entity()
export class BookingAudit {
  @Column()
  @IsBoolean()
  readonly approved: boolean;

  @Column()
  @ValidateNested()
  readonly setBy: UserRef;

  @Column()
  @IsDate()
  readonly setOn: Date;

  @Column()
  @IsString()
  readonly comment: string;

  constructor(approved: boolean, setBy: UserRef, setOn: Date, comment: string) {
    this.approved = approved;
    this.setBy = setBy;
    this.setOn = setOn;
    this.comment = comment;
  }
}
