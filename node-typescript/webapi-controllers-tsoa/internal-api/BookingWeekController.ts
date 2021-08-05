import { injectable, inject } from "inversify";
import { Controller, Get, OperationId, Route, Tags } from "tsoa";
import { LastWeekForGroupQuery } from "~/Domain/queries";
import { BookingWeekBaseDto } from "../../model/BookigWeekBaseDto";

@Route("api/internal/v1/bookingWeek")
@injectable()
export class BookingWeekController extends Controller {
  constructor(
    @inject(LastWeekForGroupQuery) private lastWeekForGroupQuery: LastWeekForGroupQuery
  ) {
    super();
  }

  @Get("last-week-for-group")
  @OperationId("getLastBookingWeekInBookingGroup")
  @Tags("InternalV1")
  public async getLastWeekForGroup(): Promise<BookingWeekBaseDto[]> {
    const data = await this.lastWeekForGroupQuery.query();

    return data.map(x => BookingWeekBaseDto.Create(x));
  }
}
