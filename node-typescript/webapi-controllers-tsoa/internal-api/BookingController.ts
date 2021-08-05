import { injectable, inject } from "inversify";
import { Controller, Get, OperationId, Route, Tags } from "tsoa";
import { ObjectId } from "bson";
import { WorkRequestServiceNew } from "~/Domain/service";
import { WorkRequestRepository } from "~/Domain/repository";
import { BookingDto } from "../../model/BookingDto";
import { BookingDtoFactory } from "../../factory/BookingDtoFactory";

@Route("api/internal/v1/booking")
@injectable()
export class BookingController extends Controller {
  constructor(
    @inject(WorkRequestServiceNew) private workRequestService: WorkRequestServiceNew,
    @inject(WorkRequestRepository) private workRequestRepository: WorkRequestRepository,
    @inject(BookingDtoFactory) private bookingDtoFactory: BookingDtoFactory
  ) {
    super();
  }

  @Get("{bookingId}")
  @OperationId("getBookingById")
  @Tags("InternalV1")
  public async getById(@Route() bookingId: string): Promise<BookingDto> {
    const objectId = ObjectId.createFromHexString(bookingId);
    const wr = await this.workRequestRepository.findByBookingId(objectId);

    if (!wr) {
      throw new Error("booking not found");
    }

    const dto = await this.bookingDtoFactory.create(wr, objectId);
    return dto;
  }
}
