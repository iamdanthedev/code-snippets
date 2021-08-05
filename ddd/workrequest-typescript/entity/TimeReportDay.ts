import { Column, Entity } from "~/Domain/metadata";
import { OnCallPeriod } from "./types/OnCallPeriod";
import { Preparedness } from "./types/PreparednessPeriod";
import { TimeReportStatus } from "~/Shared/Enums";

export enum AbsenceType {
  SickDay = "SickDay",
  ChildCare = "ChildCare",
  Vaccation = "Vaccation",
  Other = "Other",
  None = "None"
}

@Entity()
export class TimeReportDay {
  @Column()
  from: Time | null;

  @Column()
  to: Time | null;

  @Column()
  breakMinutes: number;

  @Column()
  absence: AbsenceType;

  @Column()
  onCall: OnCallPeriod[];

  @Column()
  preparedness: Preparedness[];

  @Column()
  status: TimeReportStatus;

  @Column()
  mileage: number;

  @Column()
  comment: string;
}
