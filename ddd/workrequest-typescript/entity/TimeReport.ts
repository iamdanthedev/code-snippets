import { IsEnum, IsString } from "class-validator";
import { Column, Entity } from "~/Domain/metadata";
import { TimeReportStatus } from "~/Shared/Enums";
import { ObjectID } from "bson";
export { TimeReportStatus };

// @unused
// will changed later
@Entity()
export class TimeReport {
  @Column()
  @IsEnum(TimeReportStatus)
  status: TimeReportStatus;

  @Column()
  @IsString()
  changeByUserId: ObjectID;
}
