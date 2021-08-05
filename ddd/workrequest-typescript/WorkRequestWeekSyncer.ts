import { isEmpty } from "lodash";
import { WorkRequestWeekRepository } from "~/Domain/repository";
import { WorkRequestAggregate } from "~/Domain/service";
import { TransactionCtx } from "~/common/interface";
import { WorkRequestStatus, WorkRequestWeek } from "~/Domain/types";

export class WorkRequestWeekSyncer {
  constructor(private workRequestWeekRepository: WorkRequestWeekRepository) {}

  async sync(aggregate: WorkRequestAggregate, trx: TransactionCtx) {
    await this.workRequestWeekRepository.removeAllByWorkRequestId(aggregate.id);

    if (isEmpty(aggregate.workRequest.duration)) {
      return;
    }

    if (aggregate.workRequest.status === WorkRequestStatus.Draft) {
      return;
    }

    const weeks = aggregate.durationWeeks;

    if (weeks.length === 0) {
      return;
    }

    const workRequestWeeks = weeks.map(week => {
      return WorkRequestWeek.Create(week, aggregate.workRequest, aggregate.customer);
    });

    await this.workRequestWeekRepository.insertMany(workRequestWeeks, trx);
  }
}
