import { ObjectID } from "bson";
import moment from "moment";
import { IsDate } from "class-validator";
import { Column, Entity } from "~/Domain/metadata";

import { UserRef } from "../../misc";

import { RideType, TravelRequestTime } from "~/Shared/Enums";

export { RideType, TravelRequestTime };

export class TravelRequestResponse {
  sentBy: UserRef;
  sentOn: Date;
}

@Entity()
export class TravelRequest {
  static Create(userRef: UserRef) {
    const item = new TravelRequest();
    item.sentBy = userRef;
    item.sentOn = new Date();
    return item;
  }

  @Column()
  _id = new ObjectID();

  @Column()
  sentBy: UserRef;

  @Column()
  @IsDate()
  sentOn: Date;

  @Column()
  response: TravelRequestResponse;

  @Column()
  @IsDate()
  deadline: Date;

  @Column()
  rides: TravelRequestReturnRide[];

  @Column()
  luggage: string;

  @Column()
  isCancelable: boolean;

  @Column()
  isFlexible: boolean;

  @Column()
  shouldBeBookedDirectly: string;

  @Column()
  travelSuggestion: string;

  @Column()
  travelPreferences: string;

  getPeriod() {
    const items = this.rides.flatMap(x => [x.dir1?.date, x.dir2?.date]);
    return items
      .compact()
      .map(x => moment.utc(x).format("L"))
      .join(" ");
  }
}

export class TravelRequestReturnRide {
  dir1: TravelRequestRide;
  dir2: TravelRequestRide;
  rideType: RideType;
  transportationType: string;

  constructor(
    dir1: TravelRequestRide,
    dir2: TravelRequestRide,
    rideType: RideType,
    transportationType: string
  ) {
    this.dir1 = dir1;
    this.dir2 = dir2;
    this.rideType = rideType;
    this.transportationType = transportationType;
  }
}

export class TravelRequestRide {
  city: string;
  date: Date;
  time: TravelRequestTime;
  comment = "";

  constructor(city: string, date: Date, time: TravelRequestTime, comment?: string) {
    this.city = city;
    this.date = date;
    this.time = time;
    this.comment = comment || "";
  }
}
