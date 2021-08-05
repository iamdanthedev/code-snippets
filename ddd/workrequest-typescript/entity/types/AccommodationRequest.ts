import { ObjectID } from "bson";
import { UserRef } from "../../misc";
import { Column, Entity, Subdoc } from "~/Domain/metadata";
import { IsDate, IsMongoId, ValidateNested } from "class-validator";
import { HospitalityPaidBy, AccommodationTypeOf } from "~/Shared/Enums";
import { AccommodationPeriod } from "./AccommodationRequestPeriod";

export { HospitalityPaidBy, AccommodationTypeOf };

export class AccommodationRequestResponse {
  sentBy: UserRef;
  sentOn: Date;
}

@Entity()
export class AccommodationRequest {
  static Create(sentBy: UserRef) {
    const item = new AccommodationRequest();
    item.sentBy = sentBy;
    return item;
  }

  private constructor() {}

  @Column()
  @IsMongoId()
  _id = new ObjectID();

  @Column()
  @ValidateNested()
  sentBy: UserRef;

  @Column()
  @IsDate()
  sentOn: Date = new Date();

  @Column()
  response: AccommodationRequestResponse | null = null;

  @Column()
  title: string;

  @Column()
  @IsDate()
  deadline: Date;

  @Column()
  country: string;

  @Column()
  city: string;

  @Column()
  customerAddress: string;

  @Column()
  budget: string;

  @Column()
  paidBy: HospitalityPaidBy;

  @Column()
  accommodationSuggestion: AccommodationTypeOf;

  @Column()
  carAccess: string;

  @Column()
  walkingDistance: string;

  @Column()
  accommodationType: string[];

  @Column()
  sharedConveniences: string;

  @Column()
  additionalInfo: string;

  @Column()
  shouldBeBookedDirectly: string;

  @Column()
  accommodationPreferences: string;

  @Column()
  periods: AccommodationPeriod[] = [];

  @Column()
  periodInput: string;

  get location() {
    return this.city || "";
  }
}
