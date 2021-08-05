import { Booking, WorkRequest, WorkRequestDuration } from "~/Domain/types";
import { isEmpty } from "lodash";
import { durationsToWeeks1, omit } from "~/common";
import moment from "moment";

export class WorkRequestStatusController {
  constructor(private closeWorkRequest: () => void) {}

  closeIfFullyBooked(durations: WorkRequestDuration[], bookings: Booking[]) {
    if (isFullyBooked(durations, bookings)) {
      this.closeWorkRequest();
    }
  }
}

function isFullyBooked(durations: WorkRequestDuration[], bookings: Booking[]) {
  if (isEmpty(durations)) {
    return false;
  }

  const wrDurations = flattenByVacancies(durations);
  const wrWeeks = durationsToWeeks1(wrDurations, false).map(dateToWeek);
  const bookingWeeks = bookings.map(x => x.week).map(dateToWeek);

  return allIncluded(wrWeeks, bookingWeeks);
}

const dateToWeek = (date: Date) =>
  moment
    .utc(date)
    .startOf("isoWeek")
    .format("WW-GGGG");

const flattenByVacancies = (duration: WorkRequestDuration[]) => {
  return duration
    .map(x => [...Array(x.vacancies)].map(() => ({ ...omit(x, "vacancies") })))
    .flat();
};

function allIncluded(includedInto: string[], values: string[]) {
  includedInto = [...includedInto];

  for (const value of values) {
    includedInto.remove(value);
  }

  return includedInto.length === 0;
}
