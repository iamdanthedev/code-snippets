import { inject, injectable } from "inversify";
import { ObjectId } from "bson";
import { ConsultantApplicationDelegatedEvent } from "@bonliva/message-bus";
import { MessageHandler } from "~/Service";
import { ConsultantApplicationService, ConsultantServiceNew } from "~/Domain/service";
import { TodoRepository, UserRepository } from "~/Domain/repository";
import { Todo, User } from "~/Domain/types";
import { UserRef } from "~/Domain/ref";
import locale from "~/locale";
import { SMSCommunication } from "~/AppService";
import { ConsultantEventFactory } from "~/Domain/factory";

@injectable()
export class ConsultantApplicationDelegatedEventHandler extends MessageHandler<
  ConsultantApplicationDelegatedEvent
> {
  constructor(
    @inject(TodoRepository) private todoRepository: TodoRepository,
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(ConsultantServiceNew) private consultantService: ConsultantServiceNew,
    @inject(ConsultantApplicationService)
    private consultantApplicationService: ConsultantApplicationService,
    @inject(SMSCommunication) private smsCommunication: SMSCommunication
  ) {
    super();
  }

  async handle() {
    const [consultant, delegatedToUser, delegatedByUser, todo] = await Promise.all([
      this.consultantService.getById(
        ObjectId.createFromHexString(this.message.consultantId)
      ),
      this.userRepository.findById(this.message.delegatedToUserId),
      this.userRepository.findById(this.message.delegatedByUserId),
      this.todoRepository.findById(this.message.todoId)
    ]);

    consultant.setResponsiblePerson(new UserRef(delegatedToUser));
    consultant.eventLog.push(
      ConsultantEventFactory.CommentEvent(
        locale.UserDelegatedConsultantTo(delegatedByUser.Name, delegatedToUser.Name),
        new UserRef(delegatedByUser)
      )
    );

    const result = await this.consultantService.persist(consultant);

    if (result.isOk) {
      await this.notifyManager(todo, delegatedToUser);
      return;
    }

    throw new Error(result.toString());
  }

  private async notifyManager(todo: Todo, delegatedToUser: User) {
    const managerId = delegatedToUser.Manager;

    if (managerId && !managerId.equals(this.message.delegatedByUserId)) {
      await this.smsCommunication.sendToUser(
        managerId,
        locale.NewConsultantApplicationOCTodo(todo.Description, delegatedToUser.Name)
      );
    }
  }
}
