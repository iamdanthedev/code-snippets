import DataLoader from "dataloader";
import { ObjectID } from "bson";
import {
  Consultant,
  ContactPerson,
  ContractArticle,
  Customer,
  Project,
  SMSMessage
} from "../types";
import { TodoEntity } from "~/Domain/service";

export const IDataLoaderType = Symbol("IDataLoaderType");

export interface IDataLoader {
  contactPersonsByCustomer: DataLoader<ObjectID, ContactPerson[]>;
  contractArticles: DataLoader<ObjectID, ContractArticle>;
  consultants: DataLoader<ObjectID, Consultant>;
  customers: DataLoader<ObjectID, Customer>;
  projects: DataLoader<ObjectID, Project>;
  todos: DataLoader<ObjectID, TodoEntity>;
  todosUnordered: DataLoader<ObjectID, TodoEntity>;
  smsMessages: DataLoader<ObjectID, SMSMessage>;

  getCustomerChildrenDeep: DataLoader<ObjectID, Customer[]>;
  getContactPersonsByRootCustomer: DataLoader<ObjectID, ContactPerson[]>;
}
