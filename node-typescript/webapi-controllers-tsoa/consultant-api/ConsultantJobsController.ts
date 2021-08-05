import { injectable, inject } from "inversify";
import express from "express";
import { ObjectId } from "bson";
import moment from "moment";
import { Controller, Get, Route, Security, OperationId, Tags } from "tsoa";
import { ConsultantAppSettingsRepository } from "~/Domain/repository";
import { WorkRequestsQuery } from "~/Domain/queries";
import { IUserContext, IUserContextType } from "~/Shared/interface";

@Route("api/consultant-app/v1/consultant-jobs")
@injectable()
export class ConsultantJobsController extends Controller {
  constructor(
    @inject(ConsultantAppSettingsRepository)
    private consultantAppSettingsRepository: ConsultantAppSettingsRepository,
    @inject(WorkRequestsQuery) private workRequestsQuery: WorkRequestsQuery,
    @inject(IUserContextType) private userContext: IUserContext
  ) {
    super();
  }

  @Security("custom", ["Consultant"])
  @Get("has-ongoing-applications")
  @OperationId("hasOngoingApplications")
  @Tags("ConsultantAppV1")
  async hasOngoingApplications(): Promise<{ total: number }> {
    const cursor = await this.workRequestsQuery.filterWorkRequests({
      applicants: [this.userContext._id],
      dontRestrictAreasOfExpertise: true,
      from: moment
        .utc()
        .startOf("isoWeek")
        .toDate(),
      to: moment
        .utc()
        .startOf("isoWeek")
        .add(5, "years")
        .toDate()
    });

    const total = await cursor.count();

    return { total };
  }

  @Security("custom", ["Consultant"])
  @Get("has-ongoing-bookmarked-jobs")
  @OperationId("hasOngoingBookmarkedJobs")
  @Tags("ConsultantAppV1")
  async hasOngoingBookmarkedJobs(): Promise<{ total: number }> {
    const bookmarks = await this.consultantAppSettingsRepository.getField(
      this.userContext._id,
      "workRequestBookmarks"
    );

    if (bookmarks.length === 0) {
      return { total: 0 };
    }

    // check for uptodate bookmarks
    const cursor = await this.workRequestsQuery.filterWorkRequests({
      includeOnlyIds: bookmarks.map(x => x.workrequestId),
      dontRestrictAreasOfExpertise: true,
      from: moment
        .utc()
        .startOf("isoWeek")
        .toDate(),
      to: moment
        .utc()
        .startOf("isoWeek")
        .add(5, "years")
        .toDate()
    });

    const total = await cursor.count();

    return { total };
  }
}
