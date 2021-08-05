import { ObjectID } from "bson";
import { IParsedWorkRequestData } from "~/common/interface/IWorkRequestEmailData";
import { Column, Entity } from "~/Domain/metadata";
import { FileRef } from "../../File";

export enum WorkRequestBasisType {
  Email = "Email"
}

export class WorkRequestContactPerson {
  constructor(name: string, email: string) {
    this.name = name;
    this.email = email;
  }

  name: string;
  email: string;
}

export class WorkRequestBasisSource {
  static Create(input: IParsedWorkRequestData) {
    const item = new WorkRequestBasisSource();

    item.areaOfExpertise = input.areaOfExpertise || "";
    item.specialization = input.specialization || "";
    item.workplace = input.workplace;
    item.department = input.department;

    return item;
  }

  areaOfExpertise = "";
  specialization = "";
  workplace = "";
  department = "";
}

@Entity()
export class WorkRequestEmailBasis {
  constructor(
    messageId: string,
    from: string,
    subject: string,
    body: string,
    bodyFileRef: FileRef,
    parsedWorkRequestData: IParsedWorkRequestData
  ) {
    this.from = from;
    this.subject = subject;
    this.body = body;
    this.bodyFileRef = bodyFileRef;
    this.messageId = messageId;
    this.source = WorkRequestBasisSource.Create(parsedWorkRequestData);
    this.contactPerson = new WorkRequestContactPerson(from, from);
  }

  @Column()
  _id = new ObjectID();

  @Column()
  type = WorkRequestBasisType.Email;

  @Column()
  from: string;

  @Column()
  subject: string;

  @Column()
  receivedOn: string;

  @Column()
  body: string;

  @Column()
  bodyFileRef: FileRef;

  @Column()
  messageId: string;

  @Column()
  attachments: FileRef[] = [];

  @Column()
  source: WorkRequestBasisSource;

  @Column()
  contactPerson: WorkRequestContactPerson;
}
