import { inject, injectable } from "inversify";
import { isEmpty } from "lodash";
import { ObjectId } from "bson";
import { BookingCanceledEvent } from "@bonliva/message-bus";
import { IAILogger, IAILoggerType, MessageHandler } from "~/Service";
import { EmailCommunication, TodoAppService } from "~/AppService";
import { ConfigService, TodoFactory, WorkRequestServiceNew } from "~/Domain/service";
import {
  TodoRepository,
  UserRepository,
  WorkRequestRepository
} from "~/Domain/repository";
import { TodoStatus } from "~/Shared/Enums";

@injectable()
export class BookingCanceledEventHandler extends MessageHandler<BookingCanceledEvent> {
  constructor(
    @inject(IAILoggerType) private logger: IAILogger,
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(WorkRequestRepository) private workRequestRepository: WorkRequestRepository,
    @inject(WorkRequestServiceNew) private workRequestService: WorkRequestServiceNew,
    @inject(ConfigService) private configService: ConfigService,
    @inject(EmailCommunication) private emailCommunication: EmailCommunication,
    @inject(TodoRepository) private todoRepository: TodoRepository,
    @inject(TodoAppService) private todoAppService: TodoAppService
  ) {
    super();
  }

  async handle() {
    const { bookingId } = this.message;
    const workRequest = await this.workRequestService.getByBookingId(
      ObjectId.createFromHexString(bookingId)
    );
    const booking = workRequest.getBooking(ObjectId.createFromHexString(bookingId));
    const project = workRequest.getBookingProject(
      ObjectId.createFromHexString(bookingId)
    );

    if (!booking.isCanceled) {
      return this.logger.traceError(
        new Error(
          `Received userCanceledBooking event, but booking is not canceled: ${this.message.bookingId}`
        )
      );
    }

    const records = await this.todoRepository.collection
      .find({
        UniqueKey: TodoFactory.GetNewConsultantBookedFirstTimeTodoKey(booking._id),
        Status: { $ne: TodoStatus.Done }
      })
      .toArray();

    if (records.length) {
      for (const record of records) {
        const entity = TodoFactory.FromExisting(record);
        await this.todoAppService.setStatusForTodo(entity.id, TodoStatus.Done);
      }
    }

    const recipients: Array<{ name: string; email: string }> = [];

    if (project && !isEmpty(project.Members.length)) {
      const memberIds = project.Members.map(x => x.PersonId);

      const users = await this.userRepository.findByIds(memberIds).toArray();

      const ocIds = users
        .filter(x => x.Manager)
        .map(x => x.Manager)
        .uniqueBy(x => x.toString());

      if (ocIds.length > 0) {
        const ocs = await this.userRepository.findByIds(ocIds).toArray();
        recipients.push(...ocs.map(x => ({ name: x.Name, email: x.Email })));
      }
    }
  }
}
