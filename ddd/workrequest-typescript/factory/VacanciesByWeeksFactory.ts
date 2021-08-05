import { clamp, cloneDeep, compact, isEmpty } from "lodash";
import {
  dateToWeekYear1,
  durationToWeeks,
  weeksToDurations1,
  weekYearToDate1
} from "~/common";
import { WorkRequestWeekParam } from "../../../types/workrequests/types/WorkRequestWeekParam";
import { WorkRequestDuration } from "../../../types/workrequests/types/WorkRequestDuration";

export class VacanciesByWeeksFactory {
  static Create(durations: WorkRequestDuration[]): WorkRequestWeekParam[] {
    return VacanciesByWeeksFactory.DurationsToWeekParams(durations);
  }

  static ReduceByOne(current: WorkRequestWeekParam[], dates: Date[]) {
    if (isEmpty(dates)) {
      return current;
    }

    const result = cloneDeep(compact(current));

    dates.forEach(date => {
      const { week, year } = dateToWeekYear1(date);

      const item = result?.find(x => x.week === week && x.year === year);

      if (!item) {
        return;
      }

      item.openVacancies = clamp(item.openVacancies - 1, 0, 100);
    });

    return result;
  }

  static ChangeInWeek(
    current: WorkRequestWeekParam[],
    week: number,
    year: number,
    change: number
  ) {
    const result = cloneDeep(compact(current));

    const found = result?.find(x => x.week === week && x.year === year);

    if (!found) {
      result.push(new WorkRequestWeekParam({ week, year }, clamp(change, 0, 99)));
    } else {
      found.openVacancies = clamp(found.openVacancies + change, 0, 99);
    }

    return result;
  }

  static TriggerWeek(current: WorkRequestWeekParam[], week: number, year: number) {
    const result = cloneDeep(compact(current));
    const found = result?.find(x => x.week === week && x.year === year);

    if (found) {
      found.isDisabled = !found.isDisabled;
    }

    return result;
  }

  static ChangeByNewDurations(
    current: WorkRequestWeekParam[],
    prevDurations: WorkRequestDuration[],
    currentDurations: WorkRequestDuration[]
  ) {
    if (isEmpty(currentDurations)) {
      return [];
    }

    const result = cloneDeep(compact(current));

    const diff = VacanciesByWeeksFactory.GetVacanciesDiff(
      prevDurations,
      currentDurations
    );

    diff.forEach(d => {
      const item = result?.find(x => x.week === d.week && x.year === d.year);

      if (!item && d.change > 0) {
        result.push(new WorkRequestWeekParam({ week: d.week, year: d.year }, d.change));
        return;
      } else if (item) {
        item.openVacancies = item.openVacancies - d.change;
      }
    });

    return result;
  }

  public static VacanciesAsDurations(current: WorkRequestWeekParam[]) {
    const vacant = compact(current).filter(x => x.openVacancies > 0 && !x.isDisabled);
    const weeks = vacant.map(x => weekYearToDate1({ week: x.week, year: x.year }));
    return weeksToDurations1(weeks);
  }

  private static GetVacanciesDiff(
    before: WorkRequestDuration[],
    after: WorkRequestDuration[]
  ) {
    const wpBefore = VacanciesByWeeksFactory.DurationsToWeekParams(before);
    const wpAfter = VacanciesByWeeksFactory.DurationsToWeekParams(after);

    const result: Array<{ week: number; year: number; change: number }> = [];

    wpAfter.forEach(x => {
      result.push({
        week: x.week,
        year: x.year,
        change: x.openVacancies
      });
    });

    wpBefore.forEach(x => {
      const item = result?.find(y => y.week === x.week && y.year === x.year);

      if (!item) {
        result.push({ week: x.week, year: x.year, change: -x.openVacancies });
        return;
      }

      item.change = item.change - x.openVacancies;
    });

    return result;
  }

  private static DurationsToWeekParams(
    durations: WorkRequestDuration[]
  ): WorkRequestWeekParam[] {
    if (isEmpty(durations)) {
      return [];
    }

    const allWeeks: WorkRequestWeekParam[] = [];

    for (const duration of durations) {
      const weeks = durationToWeeks(duration.from, duration.to)
        .map(x => dateToWeekYear1(x))
        .map(x => new WorkRequestWeekParam(x, duration.vacancies));

      allWeeks.push(...weeks);
    }

    return allWeeks.uniqueByWith(
      x => `${x.week}-${x.year}`,
      (a, b) => new WorkRequestWeekParam(a.weekYear, a.openVacancies + b.openVacancies)
    );
  }
}
