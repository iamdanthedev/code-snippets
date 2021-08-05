import { ObjectID } from "bson";
import { inject, injectable } from "inversify";
import { isEmpty } from "lodash";
import {
  BookingWeekRepository,
  ConsultantRepository,
  CustomerRepository,
  InvoiceRepository,
  ProjectRepository,
  WorkRequestRepository,
  WorkRequestWeekRepository
} from "~/Domain/repository";
import { IUserContext, IUserContextType } from "~/Shared/interface";
import {
  InvoiceProvider,
  TimeReportStatus,
  Workplace,
  WorkRequest
} from "~/Domain/types";
import { TransactionCtx } from "~/common/interface";
import { WorkRequestAggregate } from "./WorkRequestAggregate";
import { BookingWeekSyncer } from "./BookingWeekSyncer";
import { WorkRequestWeekSyncer } from "./WorkRequestWeekSyncer";
import { ConfigService } from "../ConfigService/ConfigService";
import {
  ICustomerNumberResolver,
  ICustomerNumberResolverType
} from "../../interface/ICustomerNumberResolver";
import { InvalidUserInputError } from "~/common/errors";

@injectable()
export class WorkRequestServiceNew {
  private _bookingWeekSyncer = new BookingWeekSyncer(this.bookingWeekRepository);
  private _workRequestWeekSyncer = new WorkRequestWeekSyncer(
    this.workRequestWeekRepository
  );

  constructor(
    @inject(BookingWeekRepository) private bookingWeekRepository: BookingWeekRepository,
    @inject(ConsultantRepository) private consultantRepository: ConsultantRepository,
    @inject(CustomerRepository) private customerRepository: CustomerRepository,
    @inject(InvoiceRepository) private invoiceRepository: InvoiceRepository,
    @inject(ProjectRepository) private projectRepository: ProjectRepository,
    @inject(ConfigService) private configService: ConfigService,
    @inject(WorkRequestRepository) private workRequestRepository: WorkRequestRepository,
    @inject(WorkRequestWeekRepository)
    private workRequestWeekRepository: WorkRequestWeekRepository,
    @inject(ICustomerNumberResolverType)
    private customerNumberResolver: ICustomerNumberResolver,
    @inject(IUserContextType) private userCtx: IUserContext
  ) {
    this._bookingWeekSyncer = new BookingWeekSyncer(bookingWeekRepository);
  }

  async getFromRecords(workRequests: WorkRequest[]) {
    return workRequests.map(workRequest => this.createFromWorkRequest(workRequest));
  }

  async getByWorkRequestId(workRequestId: ObjectID, trx?: TransactionCtx) {
    const workRequest = await this.workRequestRepository.findById(workRequestId, trx);
    return this.createFromWorkRequest(workRequest);
  }

  async getByBookingId(bookingId: ObjectID, trx?: TransactionCtx) {
    const workRequest = await this.workRequestRepository.findByBookingId(bookingId, trx);
    return this.createFromWorkRequest(workRequest);
  }

  async getByEventId(eventId: ObjectID, trx?: TransactionCtx) {
    const workRequest = await this.workRequestRepository.findByEventId(eventId, trx);
    return this.createFromWorkRequest(workRequest);
  }

  async getByBookingGroupId(bookingGroupId: ObjectID | string, trx?: TransactionCtx) {
    const workRequest = await this.workRequestRepository.findByBookingGroupId(
      ObjectID.createFromHexString(bookingGroupId.toString()),
      trx
    );
    return this.createFromWorkRequest(workRequest);
  }

  async getByAccommodationRequestId(requestId: ObjectID, trx?: TransactionCtx) {
    const workRequest = await this.workRequestRepository.findByAccommodationRequestId(
      requestId,
      trx
    );
    return this.createFromWorkRequest(workRequest);
  }

  async getByTravelRequestId(requestId: ObjectID, trx?: TransactionCtx) {
    const workRequest = await this.workRequestRepository.findByTravelRequestId(
      requestId,
      trx
    );
    return this.createFromWorkRequest(workRequest);
  }

  getByCustomerId(customerId: ObjectID) {
    return this.getByCustomerIds([customerId]);
  }

  async getByCustomerIds(customerIds: ObjectID[]) {
    const workRequests = await this.workRequestRepository
      .findByCustomerIds(customerIds)
      .toArray();

    /**
     * this method can be optimised by prefecting all the customer, projects and consultants
     * maybe via dataloaders
     */

    return Promise.all(workRequests.map(x => this.createFromWorkRequest(x)));
  }

  async getByConsultantBookedId(id: ObjectID) {
    const workRequests = await this.workRequestRepository
      .findByBookedConsultantId(id)
      .toArray();

    return Promise.all(workRequests.map(x => this.createFromWorkRequest(x)));
  }

  async getCustomersRefNoApproval(workplace: Workplace, key: string) {
    const { departmentRefs, customerRef } = workplace;
    const ids =
      departmentRefs?.length > 0
        ? departmentRefs.map(x => x.Id)
        : customerRef
        ? [customerRef.Id]
        : [];

    return ids.length > 0
      ? await this.customerRepository.getNoApprovalRefs(ids, key)
      : [];
  }

  async findByConsultantTimeReportStatus(
    consultantId: ObjectID,
    status: TimeReportStatus[],
    includeEmpty: boolean
  ) {
    if (isEmpty(status)) {
      throw new Error("missing status");
    }

    const workRequests = await this.workRequestRepository
      .findByConsultantTimeReportStatus(consultantId, status, includeEmpty)
      .toArray();

    return workRequests.map(x => this.createFromWorkRequest(x));
  }

  async createFromWorkRequest(workRequest: WorkRequest) {
    const [projects, customer, departments, consultants, invoices] = await Promise.all([
      this.projectRepository.findByIds(workRequest.allProjectIds).toArray(),
      workRequest.customerId
        ? this.customerRepository.findById(workRequest.customerId)
        : null,
      workRequest.workplace &&
        this.customerRepository
          .findByIds(workRequest.workplace.departmentRefs.map(x => x.Id))
          .toArray(),
      this.consultantRepository.findByIds(workRequest.consultantIds).toArray(),
      this.invoiceRepository.getByInvoiceNumbers(workRequest.invoiceNumbers).toArray()
    ]);

    return WorkRequestAggregate.Create(
      workRequest,
      projects,
      customer,
      departments,
      consultants,
      invoices,
      false
    );
  }

  async setExpertise(
    workRequest: WorkRequestAggregate,
    areaOfExpertise: string,
    specializations: string[],
    trx?: TransactionCtx
  ) {
    if (workRequest.hasNonOpenBookings()) {
      throw new InvalidUserInputError(
        "Cannot change expertise on a work request that has closed bookings"
      );
    }

    workRequest.changeExpertise(areaOfExpertise, specializations);

    if (workRequest.workRequest.workplace) {
      const customerNumber = await this.customerNumberResolver.getForWorkplace(
        areaOfExpertise,
        workRequest.workRequest.workplace,
        trx
      );

      workRequest.bookings.forEach(booking => {
        booking.setCustomerNumber(customerNumber);
      });
    } else {
      workRequest.bookings.forEach(booking => {
        booking.setCustomerNumber("");
      });
    }
  }

  setCostCenter(workRequest: WorkRequestAggregate, costCenterId: string) {
    const costCenter = this.configService.getCostCenter(costCenterId);
    workRequest.changeCostCenter(costCenter);
  }

  async setWorkplace(
    workRequest: WorkRequestAggregate,
    areaOfExpertise: string,
    workPlace: Workplace,
    trx?: TransactionCtx
  ) {
    if (workRequest.hasNonOpenBookings()) {
      throw new InvalidUserInputError(
        "Cannot change customer on a work request that has closed bookings"
      );
    }

    const customerNumber = await this.customerNumberResolver.getForWorkplace(
      areaOfExpertise,
      workPlace,
      trx
    );

    workRequest.setWorkplace(workPlace);
    workRequest.bookings.forEach(booking => {
      booking.setCustomerNumber(customerNumber);
    });
  }

  async getCustomersNames(workRequest: WorkRequestAggregate) {
    const parents = await this.customerRepository.getParents(workRequest.customerId);
    return parents.map(x => x.Name).join(", ");
  }

  getRegion(workRequest: WorkRequestAggregate) {
    const id = workRequest.departmentIds?.[0] || workRequest.customerId;

    if (!id) {
      return Promise.resolve("");
    }

    return this.customerRepository
      .findById(id)
      .then(customer => customer?.Address?.Region || "");
  }

  async resave(id: ObjectID, trx: TransactionCtx) {
    const item = await this.getByWorkRequestId(id, trx);
    await this.persist(item, trx);
  }

  async persist(workRequestAggregate: WorkRequestAggregate, trx?: TransactionCtx) {
    workRequestAggregate.workRequest.customerSearch = null;

    if (workRequestAggregate.customer) {
      const customer = await this.customerRepository.findById(
        workRequestAggregate.customer._id,
        {},
        { session: trx?.session }
      );

      workRequestAggregate.workRequest.customerSearch = customer.Search;
    }

    workRequestAggregate.workRequest.search = workRequestAggregate.getWorkRequestSearch();

    const workRequest = workRequestAggregate.isNew
      ? await this.workRequestRepository.insertOne(workRequestAggregate.workRequest, trx)
      : await this.workRequestRepository.updateOne(
          workRequestAggregate.id,
          workRequestAggregate.workRequest,
          trx
        );

    await this._bookingWeekSyncer.sync(workRequestAggregate, trx);
    await this._workRequestWeekSyncer.sync(workRequestAggregate, trx);

    return this.createFromWorkRequest(workRequest);
  }
}
