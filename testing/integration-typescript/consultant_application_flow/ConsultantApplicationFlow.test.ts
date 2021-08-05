import { ObjectID } from "bson";
import { expect } from "chai";
import { DomainHelper, sameObjectId, TestContainer } from "~/test/testUtils";
import { ConfigService, ConsultantApplicationService } from "~/Domain/service";
import { ConfigDocument, User } from "~/Domain/types";
import {
  ConsultantRepository,
  NotificationRepository,
  SMSMessageRepository,
  TodoRepository,
  UserRepository
} from "~/Domain/repository";
import { UserRef } from "~/Domain/ref";
import { TestConfigRepository } from "~/test/doubles";
import { MemoryTransport } from "~/Service";
import { ConsultantService, TodoAppService } from "~/AppService";

describe("Consultant application flow", () => {
  const { container, resolver } = TestContainer.Create({
    createAndBindTestUser: true,
    preserveDbBetweenTests: true,
    messageServiceTransport: MemoryTransport
  });

  const helper = resolver(DomainHelper);
  const applicationService = resolver(ConsultantApplicationService);
  const consultantRepo = resolver(ConsultantRepository);
  const todoRepository = resolver(TodoRepository);
  let ocUser: User;
  let user: User;

  function getConfig() {
    const config = new ConfigDocument();
    config.notifyConsultantApplicationsByTickets = true;
    config.applicationManagerByProfession = {};
    config.applicationManagerByUrl = {};
    config.defaultApplicationManager = new UserRef(ocUser);
    return config;
  }

  before(async () => {
    ocUser = await container
      .get(UserRepository)
      .create({ Name: "oc", CellPhone: "+1800TEST" });

    user = await container.get(UserRepository).create({
      Name: "user",
      CellPhone: "+1800USER"
    });

    await container.get(TestConfigRepository).setConfigDocument(getConfig());
  });

  describe("receiving application", () => {
    let response: any;

    before(async () => {
      const application = applicationService().create();
      await container.get(ConfigService).init();

      application.firstName = "test";
      application.lastName = "test";
      application.areaOfExpertise = "Kirurgi";

      response = await container.get(ConsultantApplicationService).process(application, {
        path: "",
        source: "homepage",
        withDuplicateCheck: false
      });
    });

    it("should create one consultant with responsible person == null", async () => {
      const items = await container
        .get(ConsultantRepository)
        .find({})
        .toArray();

      expect(items.length).eq(1);
      expect(items[0].ResponsiblePerson).eq(null);
    });

    it("should create one todo and assign to OC", async () => {
      const items = await container
        .get(TodoRepository)
        .find({})
        .toArray();
      expect(items.length).eq(1);
      expect(items[0].AssignedTo.PersonId.equals(ocUser._id)).eq(true);
    });

    // it("should create one web notification for OC", async () => {
    //   const items = await container.get(NotificationRepository).getAll();
    //   expect(items.length).eq(1);
    // });

    // it("should send an sms out to OC", async () => {
    //   const items = await container.get(SMSMessageRepository).getAll();
    //   expect(items.length).eq(1);
    // });

    it("should return consultantCreated field", async () => {
      const items = await container
        .get(ConsultantRepository)
        .find({})
        .toArray();

      expect(response.consultantCreated.consultantId).eq(items[0]._id.toHexString());
    });
  });

  describe("OC handling the application", () => {
    it("should not set todo Completed when OC adds a comment to consultant", async () => {
      const consultant = await consultantRepo().findOne();

      await container
        .get(ConsultantService)
        .addCommentEvent(consultant._id, "OC test", new UserRef(ocUser));
    });
  });

  describe("forwarding application to user", () => {
    let todoId: ObjectID;

    before(async () => {
      const todos = await container.get(TodoRepository).getAll();

      if (todos.length > 1) {
        throw new Error("expected to find only one todo");
      }

      todoId = todos[0]._id;
    });

    it("should forward application", async () => {
      await container
        .get(TodoAppService)
        .delegateTodo(todoId, ocUser._id, user._id, null);
    });

    // it("should create one web notification (notify the user)", async () => {
    //   const items = await container.get(NotificationRepository).getAll();
    //   expect(items.find(x => x.UserId.equals(user._id))).ok;
    // });

    // it("should create one sms notification (notify the user)", async () => {
    //   const items = await container.get(SMSMessageRepository).getAll();
    //   expect(items.length).eq(3);
    // });
  });

  describe("user interacts with consultant", () => {
    it("should set todo completed when user adds a comment to consultant", async () => {
      const consultant = await consultantRepo().findOne();

      await container
        .get(ConsultantService)
        .addCommentEvent(consultant._id, "user test", new UserRef(user));

      const todos = await container.get(TodoRepository).getAll();

      expect(todos[0].Completed).instanceOf(Date);
    });
  });

  describe("dealing with duplicates", () => {
    it("should assign a todo to responsible person", async () => {
      const ba = await helper().createUser("test");

      const duplicate = await helper().createConsultant(item => {
        item.setName("test", "test");
        item.setEmail("test@test.com");
        item.setResponsiblePerson(new UserRef(ba));
      });

      const application = applicationService().create();

      application.firstName = "test";
      application.lastName = "test";
      application.email = "test@test.com";
      application.areaOfExpertise = "Kirurgi";

      const result = await container
        .get(ConsultantApplicationService)
        .process(application, {
          path: "",
          source: "homepage",
          withDuplicateCheck: true
        });

      expect(result.duplicateFound).ok;
      expect(result.consultantCreated).eq(false);

      const todos = await todoRepository()
        .getUserTodos(ba._id)
        .toArray();

      expect(todos.length).eq(1);
      expect(todos[0].LinkedItems[0].NodeID).satisfy(sameObjectId(duplicate.id));
    });
  });

  describe("dealing with checkbiz check", () => {
    it("should add comment in event log if bisnode don't found", async () => {
      const ba = await helper().createUser("test");

      const application = applicationService().create();

      application.firstName = "test";
      application.lastName = "test";
      application.email = "test@test.com";
      application.areaOfExpertise = "Kirurgi";

      const result = await container
        .get(ConsultantApplicationService)
        .process(application, {
          path: "",
          source: "homepage",
          withDuplicateCheck: false
        });

      const consultant = await consultantRepo().findById(
        result.consultantCreated.consultantId
      );
      expect(consultant.EventLog.find(x => x.EventType === "Comment")).not.eq(undefined);
      expect(consultant.EventLog.find(x => x.EventType === "Comment").Description).match(
        /missing/i
      );
    });

    it("should add comment when bisnode check failed", async () => {
      const ba = await helper().createUser("test");

      const application = applicationService().create();

      application.firstName = "test";
      application.lastName = "test";
      application.email = "test@test.com";
      application.areaOfExpertise = "Kirurgi";
      application.ssn = "19800101-1234";

      const result = await container
        .get(ConsultantApplicationService)
        .process(application, {
          path: "",
          source: "homepage",
          withDuplicateCheck: false
        });

      const consultant = await consultantRepo().findById(
        result.consultantCreated.consultantId
      );
      expect(consultant.EventLog.find(x => x.EventType === "Comment")).not.eq(undefined);
      expect(consultant.EventLog.find(x => x.EventType === "Comment").Description).eq(
        "Konsultdata inläst\nHittade data:\nfirstNames:\nDan\npreferredFirstName: Danial\nfamilyName:\ndateOfBirth: 1980-01-01\nphoneList:\naddressList:"
      );
    });
  });
});
