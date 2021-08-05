import { expect } from "chai";
import {
  ConsultantCreator,
  CustomerHierarchy,
  CustomerHierarchyBuilder,
  DomainHelper,
  ProjectCreator,
  TestContainer,
  WorkRequestAggregateBuilder
} from "~/test/testUtils";
import {
  ConfigService,
  ConsultantAggregate,
  WorkRequestServiceNew
} from "~/Domain/service";
import { BookingWeekQuery, BookingWeekQueryInput } from "~/Domain/queries";
import { Workplace, Project, EmployeeBookingCosts } from "~/Domain/types";
import { testUserRef } from "~/data/testUser";
import { NodeRef } from "~/Domain/ref";
import { BookingStatus } from "~/Shared/Enums";

describe("BookingWeeksQuery", () => {
  const { resolver } = TestContainer.Create({ createAndBindTestUser: true });
  const workRequestBuilder = resolver(WorkRequestAggregateBuilder);
  const workRequestService = resolver(WorkRequestServiceNew);
  const projectBuilder = resolver(ProjectCreator);
  const consultantBuilder = resolver(ConsultantCreator);
  const customerBuilder = resolver(CustomerHierarchyBuilder);
  const query = resolver(BookingWeekQuery);
  const configService = resolver(ConfigService);
  const helper = resolver(DomainHelper);

  let customerHierarchy: CustomerHierarchy;
  let consultant1: ConsultantAggregate;
  let consultant2: ConsultantAggregate;
  let project: Project;

  async function find(input: BookingWeekQueryInput) {
    const cursor = await query().getCursor(input);
    return cursor.toArray();
  }

  before(async () => {
    await configService().init();
  });
  beforeEach(async () => {
    customerHierarchy = await customerBuilder()
      .getBuilder()
      .addOrganisation(organization => {
        organization.Name = "reg";
      })
      .addHospital(hospital => {
        hospital.Name = "hospital";
      })
      .addDepartment(department => {
        department.Name = "dept";
      })
      .addHospital(hospital => {
        hospital.Name = "clinic";
      })
      .addDepartment(department => {
        department.Name = "superdept";
      })
      .create();

    project = await projectBuilder()
      .init()
      .build();

    consultant1 = await consultantBuilder()
      .init(consultant => {
        consultant.setName("Peter", "Jackson");
        consultant.setSSN("19800101-1234");
        consultant.setEmployeeNumber("76543");
      })
      .build();

    consultant2 = await consultantBuilder()
      .init(consultant => {
        consultant.setName("John", "Jackson");
        consultant.setEmployeeNumber("34567");
      })
      .build();
  });

  describe("search by text", () => {
    it("should return all items when empty", async () => {
      await workRequestBuilder()
        .init({
          workplace: Workplace.Create(customerHierarchy[0].value, [
            customerHierarchy[0].children[0].value
          ]),
          areaOfExpertise: "",
          isDirect: true,
          customerSearch: customerHierarchy[0].value.Search
        })
        .setProjects([project])
        .setConsultant(consultant1.data)
        .addBooking(new Date("2018-02-11"))
        .addBooking(new Date("2018-02-20"))
        .build();

      const result = await find({});
      expect(result.length).eq(2);
    });

    it("should filter by text (match customer)", async () => {
      await workRequestBuilder()
        .init({
          workplace: Workplace.Create(customerHierarchy[0].value, [
            customerHierarchy[0].children[0].value
          ]),
          areaOfExpertise: "",
          isDirect: true,
          customerSearch: customerHierarchy[0].value.Search
        })
        .setProjects([project])
        .setConsultant(consultant1.data)
        .addBooking(new Date("2018-02-11"))
        .addBooking(new Date("2018-02-20"))
        .build();

      await workRequestBuilder()
        .init({
          workplace: Workplace.Create(customerHierarchy[0].value, [
            customerHierarchy[0].children[1].value
          ]),
          areaOfExpertise: "",
          isDirect: true,
          customerSearch: customerHierarchy[0].value.Search
        })
        .setProjects([project])
        .setConsultant(consultant1.data)
        .addBooking(new Date("2018-02-11"))
        .addBooking(new Date("2018-02-20"))
        .build();

      const result = await find({ text: "clinic" });
      expect(result.length).eq(2);
      expect(result[0].hospitalRef.Name).eq("reg");
      expect(result[1].hospitalRef.Name).eq("reg");
    });

    it("should filter by text (match consultant)", async () => {
      await workRequestBuilder()
        .init({
          workplace: Workplace.Create(customerHierarchy[0].value, [
            customerHierarchy[0].children[0].value
          ]),
          areaOfExpertise: "",
          isDirect: true,
          customerSearch: customerHierarchy[0].value.Search
        })
        .setProjects([project])
        .setConsultant(consultant1.data)
        .addBooking(new Date("2018-02-11"))
        .addBooking(new Date("2018-02-20"))
        .build();

      await workRequestBuilder()
        .init({
          workplace: Workplace.Create(customerHierarchy[0].value, [
            customerHierarchy[0].children[1].value
          ]),
          areaOfExpertise: "",
          isDirect: true,
          customerSearch: customerHierarchy[0].value.Search
        })
        .setProjects([project])
        .setConsultant(consultant2.data)
        .addBooking(new Date("2018-02-11"))
        .addBooking(new Date("2018-02-20"))
        .build();

      const result = await find({ text: "Peter" });
      expect(result.length).eq(2);
      expect(result[0].consultantRef.Name).includes("Peter");
    });

    it("should filter by consultant ssn", async () => {
      await workRequestBuilder()
        .init({
          workplace: Workplace.Create(customerHierarchy[0].value, [
            customerHierarchy[0].children[0].value
          ]),
          areaOfExpertise: "",
          isDirect: true,
          customerSearch: customerHierarchy[0].value.Search
        })
        .setProjects([project])
        .setConsultant(consultant1.data)
        .addBooking(new Date("2018-02-11"))
        .addBooking(new Date("2018-02-20"))
        .build();

      const result = await find({ text: "19800101-1234" });
      expect(result.length).eq(2);
      expect(result[0].consultantRef.Name).includes("Peter");
      expect(result[1].consultantRef.Name).includes("Peter");
    });

    it("should filter by consultant employee number", async () => {
      await workRequestBuilder()
        .init({
          workplace: Workplace.Create(customerHierarchy[0].value, [
            customerHierarchy[0].children[0].value
          ]),
          areaOfExpertise: "",
          isDirect: true,
          customerSearch: customerHierarchy[0].value.Search
        })
        .setProjects([project])
        .setConsultant(consultant1.data)
        .addBooking(new Date("2018-02-11"))
        .addBooking(new Date("2018-02-20"))
        .build();

      const result = await find({ text: "76543" });
      expect(result.length).eq(2);
      expect(result[0].consultantRef.Name).includes("Peter");
      expect(result[1].consultantRef.Name).includes("Peter");
    });

    it("should filter by invoice number", async () => {
      const invoice1 = await helper().createInvoice(invoice => {
        invoice.InvoiceNumber = "65432";
      });
      const invoice2 = await helper().createInvoice(invoice => {
        invoice.InvoiceNumber = "12345";
      });
      const invoice3 = await helper().createInvoice(invoice => {
        invoice.InvoiceNumber = "43256";
      });

      await workRequestBuilder()
        .init(
          {
            workplace: Workplace.Create(customerHierarchy[0].value, [
              customerHierarchy[0].children[0].value
            ]),
            areaOfExpertise: "",
            isDirect: true,
            customerSearch: customerHierarchy[0].value.Search
          },
          [invoice1, invoice2, invoice3]
        )
        .setProjects([project])
        .setConsultant(consultant1.data)
        .addBooking(new Date("2018-02-11"), null, booking => {
          booking.customerInvoicing.addInvoiceNumber(invoice1.InvoiceNumber);
        })
        .addBooking(new Date("2018-02-20"), null, booking => {
          booking.customerInvoicing.addInvoiceNumber(invoice2.InvoiceNumber);
          booking.customerInvoicing.addInvoiceNumber(invoice3.InvoiceNumber);
        })
        .build();

      const result = await find({ text: "65432" });
      expect(result.length).eq(1);
      expect(result[0].consultantRef.Name).includes("Peter");
    });

    it("should filter by department search field", async () => {
      await workRequestBuilder()
        .init({
          workplace: Workplace.Create(customerHierarchy[0].value, [
            customerHierarchy[0].children[1].children[0].value
          ]),
          areaOfExpertise: "",
          isDirect: true,
          customerSearch: customerHierarchy[0].value.Search
        })
        .setProjects([project])
        .setConsultant(consultant1.data)
        .addBooking(new Date("2018-02-11"))
        .addBooking(new Date("2018-02-20"))
        .build();

      const result = await find({ text: "superdept" });
      expect(result.length).eq(2);
      expect(result[0].departmentsRefs[0].Name).eq("superdept");
      expect(result[1].departmentsRefs[0].Name).eq("superdept");
    });
  });

  it("should filter by employee number", async () => {
    await workRequestBuilder()
      .init({
        workplace: Workplace.Create(customerHierarchy[0].value, [
          customerHierarchy[0].children[0].value
        ]),
        areaOfExpertise: "",
        isDirect: true,
        customerSearch: customerHierarchy[0].value.Search
      })
      .setProjects([project])
      .setConsultant(consultant2.data)
      .addBooking(new Date("2018-02-11"))
      .addBooking(new Date("2018-02-20"))
      .build();

    const result = await find({ employeeId: "34567" });

    expect(result.length).eq(2);
    expect(result[0].consultantRef.Name).eq("John Jackson");
    expect(result[1].consultantRef.Name).eq("John Jackson");
  });

  it("should filter by invoice number", async () => {
    const invoice1 = await helper().createInvoice(invoice => {
      invoice.InvoiceNumber = "65432";
    });
    const invoice2 = await helper().createInvoice(invoice => {
      invoice.InvoiceNumber = "12345";
    });
    const invoice3 = await helper().createInvoice(invoice => {
      invoice.InvoiceNumber = "43256";
    });

    await workRequestBuilder()
      .init(
        {
          workplace: Workplace.Create(customerHierarchy[0].value, [
            customerHierarchy[0].children[0].value
          ]),
          areaOfExpertise: "",
          isDirect: true,
          customerSearch: customerHierarchy[0].value.Search
        },
        [invoice1, invoice2, invoice3]
      )
      .setProjects([project])
      .setConsultant(consultant1.data)
      .addBooking(new Date("2018-02-11"), null, booking => {
        booking.customerInvoicing.addInvoiceNumber(invoice1.InvoiceNumber);
      })
      .addBooking(new Date("2018-02-20"), null, booking => {
        booking.customerInvoicing.addInvoiceNumber(invoice2.InvoiceNumber);
        booking.customerInvoicing.addInvoiceNumber(invoice3.InvoiceNumber);
      })
      .build();

    const result = await find({ invoiceNumber: "65432" });

    expect(result.length).eq(1);
    expect(result[0].invoices[0].invoiceNumber).eq("65432");
  });

  it("should filter by bookings status", async () => {
    const invoice1 = await helper().createInvoice(invoice => {
      invoice.InvoiceNumber = "65432";
    });

    const workRequestAggregate = await workRequestBuilder()
      .init(
        {
          workplace: Workplace.Create(customerHierarchy[0].value, [
            customerHierarchy[0].children[0].value
          ]),
          areaOfExpertise: "",
          isDirect: true,
          customerSearch: customerHierarchy[0].value.Search
        },
        [invoice1]
      )
      .setProjects([project])
      .setConsultant(consultant2.data)
      .addBooking(new Date("2018-02-11"), null, booking => {
        booking.setBookingCosts(new EmployeeBookingCosts());
      })
      .addBooking(new Date("2018-02-12"), null, booking => {
        booking.customerInvoicing.addInvoiceNumber(invoice1.InvoiceNumber);
      })
      .addBooking(new Date("2018-02-13"), null, booking => {
        booking.customerInvoicing.addInvoiceNumber(invoice1.InvoiceNumber);
        booking.setBookingCosts(new EmployeeBookingCosts());
      })
      .addBooking(new Date("2018-02-14"))
      .addBooking(new Date("2018-02-15"))
      .build();

    workRequestAggregate.cancelBooking(
      workRequestAggregate.bookings[4]._id,
      "Test reason",
      testUserRef
    );

    await workRequestService().persist(workRequestAggregate);

    const res1 = await find({ bookingStatus: [] });
    const res2 = await find({ bookingStatus: [BookingStatus.NotBilledNotPaid] });
    const res3 = await find({
      bookingStatus: [BookingStatus.NotBilledNotPaid, BookingStatus.Billed]
    });
    const res4 = await find({
      bookingStatus: [
        BookingStatus.NotBilledNotPaid,
        BookingStatus.Billed,
        BookingStatus.Paid
      ]
    });
    const res5 = await find({
      bookingStatus: [
        BookingStatus.NotBilledNotPaid,
        BookingStatus.Billed,
        BookingStatus.Paid,
        BookingStatus.BilledAndPaid
      ]
    });

    const res6 = await find({
      bookingStatus: [BookingStatus.Canceled]
    });

    expect(res1.length).eq(5);
    expect(res2.length).eq(1); // two empty ones but one canceled
    expect(res3.length).eq(2);
    expect(res4.length).eq(3);
    expect(res5.length).eq(4);
    expect(res6.length).eq(1);
  });

  it("should filter by time reported", async () => {
    const workRequestAggregate = await workRequestBuilder()
      .init({
        workplace: Workplace.Create(customerHierarchy[0].value, [
          customerHierarchy[0].children[1].children[0].value
        ]),
        areaOfExpertise: "",
        isDirect: true,
        customerSearch: customerHierarchy[0].value.Search
      })
      .setProjects([project])
      .setConsultant(consultant1.data)
      .addBooking(new Date("2018-02-01"))
      .addBooking(new Date("2018-02-02"))
      .addBooking(new Date("2018-02-03"))
      .addBooking(new Date("2018-02-04"))
      .build();

    expect(workRequestAggregate.bookings.length).eq(4);

    // TODO need to check how to update time report
  });

  it("should filter by project ids", async () => {
    const project1 = await projectBuilder()
      .init(project => {
        project.Name = "first_one";
      })
      .build();

    const project2 = await projectBuilder()
      .init(project => {
        project.Name = "another_one";
      })
      .build();

    await workRequestBuilder()
      .init(
        {
          workplace: Workplace.Create(customerHierarchy[0].value, [
            customerHierarchy[0].children[1].children[0].value
          ]),
          areaOfExpertise: "",
          isDirect: true,
          customerSearch: customerHierarchy[0].value.Search
        },
        [],
        [project1, project2]
      )
      .setConsultant(consultant1.data)
      .addBooking(new Date("2018-02-01"), params => {
        params.projectRef = NodeRef.FromProject(project1);
      })
      .addBooking(new Date("2018-02-03"), params => {
        params.projectRef = NodeRef.FromProject(project1);
      })
      .addBooking(new Date("2018-02-01"), params => {
        params.projectRef = NodeRef.FromProject(project2);
      })
      .build();

    const result1 = await find({ projectId: [project1._id] });
    const result2 = await find({ projectId: [project2._id] });
    const result3 = await find({ projectId: [project1._id, project2._id] });

    expect(result1.length).eq(2);
    expect(result2.length).eq(1);
    expect(result3.length).eq(3);
  });

  it("should filter by signed contract", async () => {
    const workRequestAggregate1 = await workRequestBuilder()
      .init({
        workplace: Workplace.Create(customerHierarchy[0].value, [
          customerHierarchy[0].children[1].children[0].value
        ]),
        areaOfExpertise: "",
        isDirect: true,
        customerSearch: customerHierarchy[0].value.Search
      })
      .setProjects([project])
      .setConsultant(consultant1.data)
      .addBooking(new Date("2018-02-01"))
      .addBooking(new Date("2018-02-02"))
      .addBooking(new Date("2018-02-03"))
      .build();

    const workRequestAggregate2 = await workRequestBuilder()
      .init({
        workplace: Workplace.Create(customerHierarchy[0].value, [
          customerHierarchy[0].children[1].children[0].value
        ]),
        areaOfExpertise: "",
        isDirect: true,
        customerSearch: customerHierarchy[0].value.Search
      })
      .setProjects([project])
      .setConsultant(consultant1.data)
      .addBooking(new Date("2018-02-01"))
      .addBooking(new Date("2018-02-02"))
      .build();

    for (const bookingGroup of workRequestAggregate1.bookingGroups) {
      bookingGroup.contractIn = true;
    }

    for (const bookingGroup of workRequestAggregate2.bookingGroups) {
      bookingGroup.contractIn = false;
    }

    await workRequestService().persist(workRequestAggregate1);
    await workRequestService().persist(workRequestAggregate2);

    const result = await find({});
    const result1 = await find({ isContractSigned: true });
    const result2 = await find({ isContractSigned: false });

    expect(result.length).eq(5);
    expect(result1.length).eq(3);
    expect(result2.length).eq(2);
  });

  it("should filter by hospital id", async () => {
    await workRequestBuilder()
      .init({
        workplace: Workplace.Create(customerHierarchy[0].value, [
          customerHierarchy[0].children[0].children[0].value
        ]),
        areaOfExpertise: "",
        isDirect: true,
        customerSearch: customerHierarchy[0].value.Search
      })
      .setProjects([project])
      .setConsultant(consultant1.data)
      .addBooking(new Date("2018-02-01"))
      .addBooking(new Date("2018-02-02"))
      .addBooking(new Date("2018-02-03"))
      .build();

    await workRequestBuilder()
      .init({
        workplace: Workplace.Create(customerHierarchy[0].value, [
          customerHierarchy[0].children[1].children[0].value
        ]),
        areaOfExpertise: "",
        isDirect: true,
        customerSearch: customerHierarchy[0].value.Search
      })
      .setProjects([project])
      .setConsultant(consultant1.data)
      .addBooking(new Date("2018-02-01"))
      .addBooking(new Date("2018-02-02"))
      .build();

    const result1 = await find({});
    const result2 = await find({
      customerIds: [customerHierarchy[0].children[0].children[0].value._id]
    });
    const result3 = await find({
      customerIds: [customerHierarchy[0].children[1].children[0].value._id]
    });
    const result4 = await find({
      customerIds: [
        customerHierarchy[0].children[0].children[0].value._id,
        customerHierarchy[0].children[1].children[0].value._id
      ]
    });

    expect(result1.length).eq(5);
    expect(result2.length).eq(3);
    expect(result3.length).eq(2);
    expect(result4.length).eq(5);
  });

  it("should filter by department id", async () => {
    await workRequestBuilder()
      .init({
        workplace: Workplace.Create(customerHierarchy[0].value, [
          customerHierarchy[0].children[0].value
        ]),
        areaOfExpertise: "",
        isDirect: true,
        customerSearch: customerHierarchy[0].value.Search
      })
      .setProjects([project])
      .setConsultant(consultant1.data)
      .addBooking(new Date("2018-02-01"))
      .addBooking(new Date("2018-02-02"))
      .addBooking(new Date("2018-02-03"))
      .build();

    await workRequestBuilder()
      .init({
        workplace: Workplace.Create(customerHierarchy[0].value, [
          customerHierarchy[0].children[1].value
        ]),
        areaOfExpertise: "",
        isDirect: true,
        customerSearch: customerHierarchy[0].value.Search
      })
      .setProjects([project])
      .setConsultant(consultant1.data)
      .addBooking(new Date("2018-02-01"))
      .addBooking(new Date("2018-02-02"))
      .build();

    const result1 = await find({});
    const result2 = await find({
      customerIds: [customerHierarchy[0].children[0].value._id]
    });
    const result3 = await find({
      customerIds: [customerHierarchy[0].children[1].value._id]
    });
    const result4 = await find({
      customerIds: [
        customerHierarchy[0].children[0].value._id,
        customerHierarchy[0].children[1].value._id
      ]
    });

    expect(result1.length).eq(5);
    expect(result2.length).eq(3);
    expect(result3.length).eq(2);
    expect(result4.length).eq(5);
  });

  describe("cost center", () => {
    beforeEach(async () => {
      await workRequestBuilder()
        .init({
          workplace: Workplace.Create(customerHierarchy[0].value, [
            customerHierarchy[0].children[0].value
          ]),
          areaOfExpertise: "",
          isDirect: true,
          customerSearch: customerHierarchy[0].value.Search
        })
        .setProjects([project])
        .setConsultant(consultant1.data)
        .addBooking(new Date("2018-02-01"))
        .addBooking(new Date("2018-02-02"), params => {
          params.costCenter = {
            id: "100",
            isActive: true,
            name: "",
            isDeleted: false
          };
        })
        .addBooking(new Date("2018-02-03"), params => {
          params.costCenter = {
            id: "101",
            isActive: true,
            name: "",
            isDeleted: false
          };
        })
        .addBooking(new Date("2018-02-04"), params => {
          params.costCenter = {
            id: "102",
            isActive: true,
            name: "",
            isDeleted: false
          };
        })
        .addBooking(new Date("2018-02-05"), params => {
          params.costCenter = null;
        })
        .addBooking(new Date("2018-02-06"), params => {
          params.costCenter = null;
        })
        .addBooking(new Date("2018-02-07"), params => {
          params.costCenter = null;
        })
        .build();
    });

    it("should filter items by a single value", async () => {
      const result = await query()
        .getCursor({ costCenter: ["100"] })
        .toArray();
      expect(result.length).eq(1);
    });

    it("should filter by multiple values", async () => {
      const result = await query()
        .getCursor({ costCenter: ["100", "101"] })
        .toArray();
      expect(result.length).eq(2);
    });

    it("should return all items when empty", async () => {
      const result = await query()
        .getCursor({ costCenter: [] })
        .toArray();
      expect(result.length).eq(7);
    });

    it("should return bw with missing cost center when cost center = empty string", async () => {
      const result = await query()
        .getCursor({ costCenter: ["Saknar kostnadsställe"] })
        .toArray();
      expect(result.length).eq(4);
    });
  });
});
