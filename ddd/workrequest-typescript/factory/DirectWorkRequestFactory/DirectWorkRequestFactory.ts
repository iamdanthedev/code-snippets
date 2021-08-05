import { inject, injectable } from "inversify";
import { UserRef, Workplace, WorkRequest } from "~/Domain/types";
import {
  ConsultantRepository,
  CustomerRepository,
  ProjectRepository,
  WorkRequestRepository
} from "~/Domain/repository";
import { TransactionCtx } from "~/common/interface";
import { ICustomerNumberResolver, ICustomerNumberResolverType } from "~/Domain/interface";
import { DirectWorkRequestFactoryInput } from "./DirectWorkRequestFactoryInput";
import { BookingGroupFactory } from "../BookingGroupFactory/BookingGroupFactory";
import { WorkRequestAggregate } from "../../WorkRequestAggregate";
// import { weeksToWorkRequestDuration } from "../../utils";

@injectable()
export class DirectWorkRequestFactory {
  constructor(
    @inject(BookingGroupFactory) private bookingGroupFactory: BookingGroupFactory,
    @inject(ConsultantRepository) private consultantRepository: ConsultantRepository,
    @inject(CustomerRepository) private customerRepository: CustomerRepository,
    @inject(ProjectRepository) private projectRepository: ProjectRepository,
    @inject(WorkRequestRepository) private workRequestRepository: WorkRequestRepository,
    @inject(ICustomerNumberResolverType)
    private customerNumberResolver: ICustomerNumberResolver
  ) {}

  public async create(
    input: DirectWorkRequestFactoryInput,
    createdBy: UserRef,
    trx?: TransactionCtx
  ): Promise<WorkRequestAggregate> {
    const [consultant, project, hospital, departments] = await Promise.all([
      this.consultantRepository.findById(
        input.consultantId,
        {},
        { session: trx.session }
      ),
      this.projectRepository.findById(input.projectId, {}, { session: trx.session }),
      this.customerRepository.findById(input.hospitalId, {}, { session: trx.session }),
      this.customerRepository
        .findByIds(input.departmentIds, {}, { session: trx.session })
        .toArray()
    ]);

    const workRequest = WorkRequest.Create({
      areaOfExpertise: input.areaOfExpertise,
      customerSearch: hospital.Search,
      workplace: Workplace.Create(hospital, departments),
      isDirect: true
    });

    workRequest.specializations = input.specializations;

    const workRequestAggregate = WorkRequestAggregate.Create(
      workRequest,
      [project],
      hospital,
      departments,
      [],
      [],
      true
    );

    workRequestAggregate.setExactDuration([]);

    const customerNumber = await this.customerNumberResolver.getForWorkplace(
      workRequestAggregate.workRequest.areaOfExpertise,
      workRequestAggregate.workRequest.workplace
    );

    const { bookingGroup, bookings } = await this.bookingGroupFactory.create({
      areaOfExpertise: input.areaOfExpertise,
      contractOptions: [],
      consultantId: input.consultantId,
      consultantSnapshot: input.consultantSnapshot,
      contractType: input.contractType,
      costCenter: input.costCenter,
      createdBy,
      customerNumber,
      projectId: input.projectId,
      weeks: input.weeks,
      accommodationRequired: input.accommodationRequired,
      travelRequired: input.travelRequired
    });

    workRequestAggregate.addBookingGroup(bookingGroup, bookings, [project], [consultant]);
    workRequestAggregate.publish();

    return workRequestAggregate;
  }
}
