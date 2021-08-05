import { inject, injectable } from "inversify";
import moment from "moment";
import { MemoryLogger } from "~/common";
import { repeatInQueue } from "~/common/repeatInQueue";
import { ICurrentTimeProvider } from "~/common/interface/ICurrentTimeProvider";
import {
  BookingWeekRepository,
  ConsultantRepository,
  TodoRepository
} from "~/Domain/repository";
import { BulkDeassignConsultantService, TodoFactory } from "~/Domain/service";
import {
  IConsultantRelationshipServiceConfig,
  IConsultantRelationshipServiceConfigType
} from "./IConsultantRelationshipServiceConfig";
import { TodoAppService } from "../TodoService/TodoAppService";

@injectable()
export class ConsultantRelationshipService {
  private warnDate: moment.Moment;
  private deassignDate: moment.Moment;
  private warnDeAssignDate: moment.Moment;
  private timeProvider: ICurrentTimeProvider;

  constructor(
    @inject(IConsultantRelationshipServiceConfigType)
    private config: IConsultantRelationshipServiceConfig,
    @inject(ConsultantRepository) private consultantRepository: ConsultantRepository,
    @inject(BulkDeassignConsultantService)
    private bulkDeassignConsultantService: BulkDeassignConsultantService,
    @inject(TodoAppService) private todoAppService: TodoAppService,
    @inject(TodoRepository) private todoRepository: TodoRepository,
    @inject(BookingWeekRepository) private bookingWeekRepository: BookingWeekRepository
  ) {}

  async work(logger: MemoryLogger, timeProvider: ICurrentTimeProvider) {
    this.timeProvider = timeProvider;

    this.warnDate = moment
      .utc(this.timeProvider.getTime())
      .startOf("day")
      .subtract(this.config.warnIfNotContactedLongerThanDays, "d");

    this.deassignDate = moment
      .utc(this.timeProvider.getTime())
      .startOf("day")
      .subtract(this.config.deassignConsultantAfterMonths, "months");

    this.warnDeAssignDate = moment
      .utc(this.timeProvider.getTime())
      .startOf("day")
      .subtract(this.config.deassignConsultantAfterMonths, "months")
      .subtract(this.config.warnDeAssignConsultantBeforeDays, "d");

    if (this.warnDate.isBefore(this.deassignDate)) {
      throw new Error("Warn date must be after deassign date");
    }

    if (this.warnDeAssignDate.isAfter(this.deassignDate)) {
      throw new Error("deassign warn date must be before deassign date");
    }

    await this.issueWarnings(logger);
    await this.deassignConsultants(logger);
    // await this.issueWarningBeforeDeassign(logger);
  }

  private async issueWarnings(logger: MemoryLogger) {
    const from = this.deassignDate.toDate();
    const to = this.warnDate.toDate();
    logger
      .blank()
      .log(`Issue warnings where last contact date: between ${from} and ${to}`);

    const items = await this.consultantRepository
      .find({
        query: {
          Unfit: { $ne: true },
          "ResponsiblePerson.PersonId": { $exists: true },
          $or: [{ LastContactDate: null }, { LastContactDate: { $gte: from, $lte: to } }]
        }
      })
      .project({ LastContactDate: 1, Name: 1, ResponsiblePerson: 1 })
      .toArray();

    logger.log(`Found consultants: ${items.length}`);

    await repeatInQueue(
      async i => {
        const item = items[i];

        const existingTodo = await this.todoRepository.findOne({
          "AssignedTo.PersonId": item.ResponsiblePerson.PersonId,
          LinkedItems: {
            $elemMatch: {
              NodeID: item._id
            }
          }
        });

        if (existingTodo) {
          logger.log(`Skip warning: a similar todo exists (${existingTodo._id})`);
          return;
        }

        const result = await this.todoAppService.addTodo(
          TodoFactory.ConsultantNotContacted(item.ResponsiblePerson, item.Name, item._id)
        );

        if (result.isOk) {
          logger.log(
            `Issued warning for ${item.ResponsiblePerson.Name}, todo id: ${result.value.id}`
          );
        }
      },
      { times: items.length, concurrency: 15 }
    );
  }

  private async issueWarningBeforeDeassign(logger: MemoryLogger) {
    const from = moment
      .utc(this.timeProvider.getTime())
      .subtract(this.config.deassignConsultantAfterMonths, "months")
      .subtract(this.config.warnDeAssignConsultantBeforeDays, "days")
      .toDate();

    const to = moment
      .utc(this.timeProvider.getTime())
      .subtract(this.config.deassignConsultantAfterMonths, "months")
      .toDate();

    const consultants = await this.consultantRepository
      .find({
        query: {
          Unfit: { $ne: true },
          "ResponsiblePerson.PersonId": { $exists: true },
          LastContactDate: { $lte: to, $gt: from },
          $or: [
            { "search.BookedPeriod.to": { $lte: moment().toDate() } },
            { "search.BookedPeriod.to": null }
          ]
        }
      })
      .project({
        LastContactDate: 1,
        Name: 1,
        ResponsiblePerson: 1
      })
      .toArray();

    logger
      .blank()
      .log(`Issue warning about losing consultants`)
      .log(`LastContactDate between(${from}, ${to})`)
      .log(`found consultants: ${consultants.length}`);

    await repeatInQueue(
      async i => {
        const item = consultants[i];
        const due = this.deassignDate.toDate();

        const existingTodo = await this.todoRepository.findOne({
          "AssignedTo.PersonId": item.ResponsiblePerson.PersonId,
          LinkedItems: {
            $elemMatch: {
              NodeID: item._id
            }
          },
          UniqueKey: "deassign_soon_warning"
        });

        if (existingTodo) {
          logger.log(`Skip warning: a similar todo exists (${existingTodo._id})`);
          return;
        }

        const result = await this.todoAppService.addTodo(
          TodoFactory.UserWillLoseConsultantSoon(
            item.ResponsiblePerson,
            item.Name,
            item._id,
            due,
            this.config.warnDeAssignConsultantBeforeDays
          )
        );

        if (result.isOk) {
          logger.log(
            `Issued warning for ${item.ResponsiblePerson.Name}, todo id: ${result.value.id}`
          );
        }
      },
      { times: consultants.length, concurrency: 15 }
    );
  }

  private async deassignConsultants(logger: MemoryLogger) {
    const startServiceDate = moment.utc(
      this.config.startDeassigningSince || new Date("2012-01-01")
    );

    const subtractedStartServiceDate = startServiceDate
      .startOf("day")
      .subtract(this.config.deassignConsultantAfterMonths, "months");

    const toStart = subtractedStartServiceDate.toDate();
    const to = this.deassignDate.toDate();
    logger.blank().log(`Deassign consultants where LastContactDate: lt ${to}`);

    const consultantsNotContacted = await this.consultantRepository
      .find({
        query: {
          Unfit: { $ne: true },
          "ResponsiblePerson.PersonId": { $exists: true },
          LastContactDate: { $lt: to, $gt: toStart },
          $or: [
            { "search.BookedPeriod.to": { $lte: moment().toDate() } },
            { "search.BookedPeriod.to": null }
          ]
        }
      })
      .project({
        LastContactDate: 1,
        Name: 1,
        ResponsiblePerson: 1
      })
      .toArray();

    // we don't care about canceled bookings
    const bookings = await this.bookingWeekRepository
      .findUpcoming()
      .project({ "consultantRef.NodeID": 1 })
      .toArray();

    const consultantsToDeAssign = consultantsNotContacted.filter(
      x => !bookings.any(y => y.consultantRef.NodeID.equals(x._id))
    );

    logger.log(`Total consultants not contacted: ${consultantsNotContacted.length}`);
    logger.log(`Total consultants to deassign: ${consultantsToDeAssign.length}`);

    await this.bulkDeassignConsultantService.deassign(
      consultantsToDeAssign.map(x => x._id)
    );
  }

  private getWarnDue(lastContactDate: Date) {
    const date = lastContactDate || new Date();

    return moment
      .utc(date)
      .startOf("day")
      .add(this.config.warnDueDays, "d")
      .set("hour", this.config.warnDueHour)
      .toDate();
  }
}
