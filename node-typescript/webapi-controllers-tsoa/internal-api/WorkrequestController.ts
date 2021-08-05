import { injectable, inject } from "inversify";
import { Controller, Get, OperationId, Route, Tags } from "tsoa";
import { ObjectId } from "bson";
import { WorkRequestServiceNew } from "~/Domain/service";
import { WorkRequestRepository } from "~/Domain/repository";
import { InternalWorkrequestDto } from "../../model/internal/InternalWorkrequestDto";
import { InternalWorkrequestDtoFactory } from "../../factory/InternalWorkrequestDtoFactory";
import { CheckWorkRequestConsultantsService } from "~/AppService";
import {
  ConsultantQualityChecksNearExpireDto,
  ExpireQualityCheck
} from "../../model/ConsultantQualityChecksNearExpireDto";

@Route("api/internal/v1/workrequest")
@injectable()
export class WorkrequestController extends Controller {
  constructor(
    @inject(WorkRequestServiceNew) private workRequestService: WorkRequestServiceNew,
    @inject(WorkRequestRepository) private workRequestRepository: WorkRequestRepository,
    @inject(CheckWorkRequestConsultantsService)
    private checkWorkRequestConsultantsService: CheckWorkRequestConsultantsService,
    @inject(InternalWorkrequestDtoFactory)
    private dtoFactory: InternalWorkrequestDtoFactory
  ) {
    super();
  }

  @Get("{workrequestId}")
  @OperationId("GetWorkrequestById")
  @Tags("InternalV1")
  public async getById(@Route() workrequestId: string): Promise<InternalWorkrequestDto> {
    const objectId = ObjectId.createFromHexString(workrequestId);
    return this.dtoFactory.create(objectId);
  }

  @Get("/all/showInApp")
  @OperationId("GetAllWorkrequestsShowInApp")
  @Tags("InternalV1")
  public async getAllWorkrequestsShowInApp(): Promise<string[]> {
    const data = await this.workRequestRepository.collection
      .find({ showInApp: true, deleted: false }, { projection: { _id: 1 } })
      .toArray();

    return data.map(x => x._id.toHexString());
  }

  @Get("{workrequestId}/expiring-quality-checks")
  @OperationId("GetExpiringQualityChecks")
  @Tags("InternalV1")
  public async getExpiringQualityChecks(
    @Route() workrequestId: string
  ): Promise<ConsultantQualityChecksNearExpireDto[]> {
    const objectId = ObjectId.createFromHexString(workrequestId);
    const data = await this.checkWorkRequestConsultantsService.checkWorkRequestConsultantsQualityChecks(
      objectId
    );

    return data.map(x =>
      ConsultantQualityChecksNearExpireDto.Create(
        x.ConsultantId,
        x.ConsultantName,
        x.ExpireQualityChecks.map(y =>
          ExpireQualityCheck.Create(y.ItemName, y.Country, y.Checked)
        )
      )
    );
  }
}
