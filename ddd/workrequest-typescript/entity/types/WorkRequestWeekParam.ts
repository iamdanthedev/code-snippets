import { WeekYear1 } from "~/common/dateToWeekYear";
import { Column, Entity } from "~/Domain/metadata";

@Entity()
export class WorkRequestWeekParam {
  @Column()
  public readonly weekYear: WeekYear1;

  @Column({ expose: "openVacancies" })
  public openVacancies: number;

  @Column({ expose: "isDisabled" })
  public isDisabled = false;

  constructor(weekYear: WeekYear1, openVacancies: number) {
    this.weekYear = weekYear;
    this.openVacancies = openVacancies;
  }

  get week() {
    return this.weekYear.week;
  }

  get year() {
    return this.weekYear.year;
  }
}
