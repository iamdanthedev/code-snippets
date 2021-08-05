import { inject, injectable } from "inversify";
import FbDataLoader from "dataloader";
import { ObjectID } from "bson";
import { IDataLoader } from "~/Domain/interface";
import {
  ConsultantRepository,
  ContactPersonRepository,
  CustomerRepository,
  ProjectRepository,
  SMSMessageRepository,
  WorkRequestRepository
} from "~/Domain/repository";
import {
  Consultant,
  ContactPerson,
  ContractArticle,
  Customer,
  Project,
  SMSMessage
} from "~/Domain/types";
import { TodoEntity, TodoService } from "~/Domain/service";

@injectable()
export class DataLoader implements IDataLoader {
  private readonly _contactPersonsByCustomer: FbDataLoader<ObjectID, ContactPerson[]>;
  private readonly _contractArticles: FbDataLoader<ObjectID, ContractArticle>;
  private readonly _consultants: FbDataLoader<ObjectID, Consultant>;
  private readonly _customers: FbDataLoader<ObjectID, Customer>;
  private readonly _projects: FbDataLoader<ObjectID, Project>;
  private readonly _todos: FbDataLoader<ObjectID, TodoEntity>;
  private readonly _todosUnordered: FbDataLoader<ObjectID, TodoEntity>;
  private readonly _smsMessages: FbDataLoader<ObjectID, SMSMessage>;
  private readonly _getCustomerChildrenDeep: FbDataLoader<ObjectID, Customer[]>;
  private readonly _getContactPersonsByRootCustomer: FbDataLoader<
    ObjectID,
    ContactPerson[]
  >;

  constructor(
    @inject(ContactPersonRepository)
    private contactPersonRepository: ContactPersonRepository,
    @inject(ConsultantRepository) private consultantRepository: ConsultantRepository,
    @inject(CustomerRepository) private customerRepository: CustomerRepository,
    @inject(ProjectRepository) private projectRepository: ProjectRepository,
    @inject(SMSMessageRepository) private smsMessageRepository: SMSMessageRepository,
    @inject(TodoService) private todoService: TodoService,
    @inject(WorkRequestRepository) private workRequestRepository: WorkRequestRepository
  ) {
    this._contactPersonsByCustomer = new FbDataLoader<ObjectID, ContactPerson[]>(
      keys => this.getContactPersonsByCustomerIdsGrouped(keys),
      { cacheKeyFn: key => key.toHexString() }
    );

    this._consultants = new FbDataLoader<ObjectID, Consultant>(
      keys => preserveOrder(this.getConsultants(keys), keys),
      { cacheKeyFn: key => key.toHexString() }
    );

    this._customers = new FbDataLoader<ObjectID, Customer>(
      keys => preserveOrder(this.getCustomers(keys), keys),
      { cacheKeyFn: key => key.toHexString() }
    );

    this._projects = new FbDataLoader<ObjectID, Project>(
      keys => preserveOrder(this.getProjects(keys), keys),
      { cacheKeyFn: key => key.toHexString() }
    );

    this._todos = new FbDataLoader<ObjectID, TodoEntity>(
      keys => preserveOrder(this.getTodos(keys), keys),
      { cacheKeyFn: key => key.toHexString() }
    );

    this._todosUnordered = new FbDataLoader<ObjectID, TodoEntity>(
      keys => nullable(this.getTodos(keys), keys),
      { cacheKeyFn: key => key.toHexString() }
    );

    this._smsMessages = new FbDataLoader<ObjectID, SMSMessage>(
      keys => preserveOrder(this.getSmsMessages(keys), keys),
      { cacheKeyFn: key => key.toHexString() }
    );

    this._getCustomerChildrenDeep = new FbDataLoader<ObjectID, Customer[]>(
      keys => Promise.all(keys.map(key => this.customerRepository.getChildrenDeep(key))),
      { cacheKeyFn: key => key.toHexString() }
    );

    this._getContactPersonsByRootCustomer = new FbDataLoader<ObjectID, ContactPerson[]>(
      keys =>
        Promise.all(
          keys.map(key =>
            this.contactPersonRepository.findByRootCustomerId(key).toArray()
          )
        ),
      { cacheKeyFn: key => key.toHexString() }
    );
  }

  get contactPersonsByCustomer() {
    return this._contactPersonsByCustomer;
  }

  get contractArticles() {
    return this._contractArticles;
  }

  get consultants() {
    return this._consultants;
  }

  get customers() {
    return this._customers;
  }

  get projects() {
    return this._projects;
  }

  get smsMessages() {
    return this._smsMessages;
  }

  get todos() {
    return this._todos;
  }

  get todosUnordered() {
    return this._todosUnordered;
  }

  get getCustomerChildrenDeep() {
    return this._getCustomerChildrenDeep;
  }

  get getContactPersonsByRootCustomer() {
    return this._getContactPersonsByRootCustomer;
  }

  private getContactPersonsByCustomerIdsGrouped(keys: ObjectID[]) {
    return this.contactPersonRepository
      .findByCustomerId(keys, true)
      .toArray()
      .then(items => {
        // group by customer id
        return keys.map(key =>
          items.filter(x => x.Customers.some(y => y.Id.equals(key)))
        );
      });
  }

  private getConsultants(keys: ObjectID[]) {
    return this.consultantRepository.findByIds(keys).toArray();
  }

  private getCustomers(keys: ObjectID[]) {
    return this.customerRepository.findByIds(keys).toArray();
  }

  private getProjects(keys: ObjectID[]) {
    return this.projectRepository.findByIds(keys).toArray();
  }

  private getTodos(keys: ObjectID[]) {
    return this.todoService.findByIds(keys, true);
  }

  private getSmsMessages(keys: ObjectID[]) {
    return this.smsMessageRepository.findByIds(keys).toArray();
  }
}

async function preserveOrder<T extends { _id: ObjectID }>(
  vals: Promise<T[]>,
  order: ObjectID[]
): Promise<T[]> {
  const items = await vals;

  if (order.length !== items.length) {
    throw new Error("different length");
  }

  return order.map(id => items.find(x => x._id.equals(id)));
}

async function nullable<T extends { _id: ObjectID }>(
  vals: Promise<T[]>,
  order: ObjectID[]
): Promise<T[]> {
  const items = await vals;

  return order.map(id => items.find(x => x._id.equals(id)) || null);
}
