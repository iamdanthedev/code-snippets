import { Address } from "~/Domain/types";

export class WorkRequestSearch {
  areaOfExpertise: string;
  /**
   * A flat representation of all durations in a work request
   */
  durationWeeks: Date[];
  searchField: string;
  searchArray: string[];
  startDateUtc: Date;
  endDateUtc: Date;
  address: Address;
  emailMessageId?: string;
}
