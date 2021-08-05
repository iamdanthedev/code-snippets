import { ObjectId } from "bson";
import {
  Controller,
  Query,
  Post,
  Route,
  SuccessResponse,
  Security,
  OperationId,
  Tags
} from "tsoa";
import { inject, injectable } from "inversify";
import { trim } from "lodash";
import {
  ConsultantAppliedForWorkrequestEvent,
  WorkRequestModifiedEvent,
  WorkrequestStatus
} from "@bonliva/message-bus";
import { WorkRequestServiceNew } from "~/Domain/service";
import {
  ITransactionProvider,
  ITransactionProviderType,
  Logger
} from "~/common/interface";
import { ConsultantRef } from "~/Domain/ref";
import { ConsultantRepository, CustomerRepository } from "~/Domain/repository";
import { EmailService } from "~/packages/microservice-infrastructure/src/email/EmailService";
import { AppConfig } from "~/packages/workrequest-microservice/src/AppConfig";
import { URLResolver } from "~/Service";
import { IUserContext, IUserContextType } from "~/Shared/interface";

export class JobApplicationResult {
  constructor(public applicationId: string, public appliedPreviously: boolean) {}
}

@Route("api/consultant-app/v1/job-application")
@injectable()
export class JobApplicationController extends Controller {
  constructor(
    @inject(ConsultantRepository) private consultantRepository: ConsultantRepository,
    @inject(WorkRequestServiceNew) private workRequestService: WorkRequestServiceNew,
    @inject(CustomerRepository) private customerRepository: CustomerRepository,
    @inject(ITransactionProviderType) private trxProvider: ITransactionProvider,
    @inject(EmailService) private emailService: EmailService,
    @inject(AppConfig) private appConfig: AppConfig,
    @inject(Logger) private logger: Logger,
    @inject(URLResolver) private urlResolver: URLResolver,
    @inject(IUserContextType) private userContext: IUserContext
  ) {
    super();
  }

  @Post()
  @Security("custom", ["Consultant"])
  @SuccessResponse("200")
  @OperationId("applyForJob")
  @Tags("ConsultantAppV1")
  public async apply(
    @Query() workrequestId: string,
    @Query() comment: string
  ): Promise<JobApplicationResult> {
    const objectId = ObjectId.createFromHexString(workrequestId);

    return this.trxProvider.withTransaction<JobApplicationResult>(async trx => {
      const consultant = await this.consultantRepository.findById1(
        this.userContext._id,
        trx
      );
      const workrequest = await this.workRequestService.getByWorkRequestId(objectId, trx);

      if (!workrequest) {
        this.setStatus(404);
        return null;
      }

      if (workrequest.isDirect) {
        this.setStatus(500);
        return null;
      }

      if (workrequest.hasConsultantApplication(this.userContext._id)) {
        const application = workrequest.getConsultantApplication(this.userContext._id);
        return new JobApplicationResult(application._id.toHexString(), true);
      }

      const consultantRef = ConsultantRef.Create(consultant);
      const application = workrequest.addConsultantApplication(consultantRef);

      const customer = await this.customerRepository.findById(
        workrequest.customerRef?.Id
      );

      const consultantAppliedForWorkrequestEvent = new ConsultantAppliedForWorkrequestEvent(
        {
          consultantId: consultant._id.toHexString(),
          consultantName: consultant.Name,
          consultantComment: trim(comment),
          organisation: customer.Parents[0]?.Name ?? "",
          workplace: workrequest.customerRef?.Name ?? "",
          department: workrequest.departmentRefs[0]?.Name,
          workrequestId: workrequest.id.toHexString(),
          workrequestCrmUrl: this.urlResolver.workRequestPageUrl(
            workrequest.id.toHexString()
          )
        }
      );

      const workrequestModifiedEvent = new WorkRequestModifiedEvent({
        workRequestId: workrequest.id.toHexString(),
        status: workrequest.workRequest.status as any,
        isNew: false,
        isDeleted: false
      });

      trx.queueMessages([consultantAppliedForWorkrequestEvent, workrequestModifiedEvent]);

      await this.workRequestService.persist(workrequest, trx);

      return new JobApplicationResult(application._id.toHexString(), false);
    });
  }
}
