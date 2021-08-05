import { Arg, Ctx, Mutation, PubSub, PubSubEngine, Resolver } from "type-graphql";
import { ObjectID } from "bson";
import { GraphQLUpload } from "apollo-server";

import { FileService, WorkRequestServiceNew } from "~/Domain/service";
import * as Domain from "~/Domain/types";

import { uploadDocument } from "~/Server/graphql/internal/Document/utils";
import { WorkRequestDurationInput } from "~/Server/graphql/internal/WorkRequest/Types/WorkRequestDurationInput";
import { Upload } from "~/Server/graphql/types/Upload";
import { WorkRequestInputValidator } from "~/Server/graphql/internal/WorkRequest/WorkRequestInputValidator";
import { ModifyWorkRequestResult } from "~/Server/graphql/internal/WorkRequest/Types/ModifyWorkRequestResult";
import { WorkRequestInput } from "~/Server/graphql/internal/WorkRequest/Types/WorkRequestInput";
import { ObjectIDScalar } from "~/Server/graphql/shared/scalars";
import { GqlContext } from "~/Server/graphql/types/GqlContext";
import { WeekYearInput } from "~/Server/graphql/shared/WeekYear/WeekYearGraphQL";
import { UploadWorkrequestDocumentResult } from "~/Server/graphql/internal/WorkRequest/Types/UploadWorkrequestDocumentResult";

import { CreateWorkRequestService } from "~/AppService/Workrequest/CreateWorkRequestService";
import { PublishWorkRequestService } from "~/AppService/Workrequest/PublishWorkRequestService";
import { UpdateWorkRequestService } from "~/AppService/Workrequest/UpdateWorkRequestService";
import { VacancyWorkRequestService } from "~/AppService/Workrequest/VacancyWorkRequestService";
import { WorkRequestDocumentService } from "~/AppService/Workrequest/WorkRequestDocumentService";

import {
  WorkRequestEvent,
  ChangeVacanciesInWeekInput,
  WorkRequestEventInput
} from "../Types";
import { AuditItem } from "~/Domain/types";
import { UserRef } from "~/Domain/types";

@Resolver()
export class WorkRequestMutationResolver {
  @Mutation(returns => ModifyWorkRequestResult)
  async createWorkRequest(
    @Ctx() ctx: GqlContext,
    @PubSub() pubSub: PubSubEngine,
    @Arg("id", type => ObjectIDScalar, { nullable: true }) id: ObjectID,
    @Arg("input", type => WorkRequestInput) input: WorkRequestInput
  ) {
    const workRequestInputValidator = ctx.container.resolve(WorkRequestInputValidator);
    const createService = ctx.container.get(CreateWorkRequestService);
    const publishService = ctx.container.get(PublishWorkRequestService);

    const errors = await workRequestInputValidator.validate(input);

    if (errors.length > 0) {
      return new ModifyWorkRequestResult(null, errors);
    }

    let workrequest = await createService.create({
      areaOfExpertise: input.AreaOfExpertise,
      specializations: input.Specializations,
      workplaceId: input.HospitalRef.Id,
      departmentId: input.DepartmentsRefs[0]?.Id,
      description: input.Description,
      lastApplicationDate: input.IsAsap ? "ASAP" : input.LastApplicationDate,
      showInApp: input.ShowInApp,
      workrequestNumber: input.WorkRequestNumber,
      qualifications: input.Qualifications,
      schedule: input.Schedule,
      tags: input.WorkRequestTags,
      documents: input.Documents.map(x => x.FileRef),
      durations: this.getWorkRequestDurations(input.Duration),
      durationCustomText: input.DurationCustomText,
      durationType: input.WorkRequestDurationType
    });

    if (input.Status === Domain.WorkRequestStatus.Published) {
      workrequest = await publishService.publish(workrequest.id);
    }

    return new ModifyWorkRequestResult(workrequest.workRequest, errors);
  }

  @Mutation(returns => ModifyWorkRequestResult)
  async updateWorkRequest(
    @Ctx() ctx: GqlContext,
    @Arg("id", type => ObjectIDScalar) id: ObjectID,
    @Arg("input", type => WorkRequestInput) input: WorkRequestInput
  ) {
    const workRequestInputValidator = ctx.container.resolve(WorkRequestInputValidator);
    const updateService = ctx.container.get(UpdateWorkRequestService);
    const publishService = ctx.container.get(PublishWorkRequestService);

    const errors = await workRequestInputValidator.validate(input);

    if (errors.length > 0) {
      return new ModifyWorkRequestResult(null, errors);
    }

    let workrequest = await updateService.update({
      workrequestId: id,
      areaOfExpertise: input.AreaOfExpertise,
      specializations: input.Specializations,
      workplaceId: input.HospitalRef.Id,
      departmentId: input.DepartmentsRefs[0]?.Id,
      description: input.Description,
      lastApplicationDate: input.IsAsap ? "ASAP" : input.LastApplicationDate,
      showInApp: input.ShowInApp,
      workrequestNumber: input.WorkRequestNumber,
      qualifications: input.Qualifications,
      schedule: input.Schedule,
      tags: input.WorkRequestTags,
      documents: input.Documents.map(x => x.FileRef),
      durations: this.getWorkRequestDurations(input.Duration),
      durationCustomText: input.DurationCustomText,
      durationType: input.WorkRequestDurationType
    });

    if (workrequest.status != input.Status) {
      if (input.Status === Domain.WorkRequestStatus.Published) {
        workrequest = await publishService.publish(workrequest.id);
      }

      if (input.Status === Domain.WorkRequestStatus.Draft) {
        workrequest = await publishService.toDraft(workrequest.id);
      }

      if (input.Status === Domain.WorkRequestStatus.Closed) {
        workrequest = await publishService.close(workrequest.id);
      }
    }

    return new ModifyWorkRequestResult(workrequest.workRequest, errors);
  }

  private getWorkRequestDurations(input: WorkRequestDurationInput[]) {
    return input.map(x => {
      const duration = Domain.WorkRequestDuration.CreateWeekType(x.From, x.To);
      duration.busyRatio = Number(x.BusyRatio);
      duration.comment = x.Comment;
      duration.vacancies = Number(x.Vacancies);
      duration.durationType = Domain.DurationType.Week; // TODO: filter based on Duration
      return duration;
    });
  }

  @Mutation(returns => UploadWorkrequestDocumentResult)
  async uploadWorkRequestDocument(
    @Ctx() ctx: GqlContext,
    @Arg("workRequestId", type => ObjectIDScalar, { nullable: true })
    workrequestId: ObjectID,
    @Arg("file", type => GraphQLUpload) file: Upload
  ): Promise<UploadWorkrequestDocumentResult> {
    const documentService = ctx.container.get(WorkRequestDocumentService);
    const fileService = ctx.container.get(FileService);
    const fileRef = await uploadDocument({ file }, fileService);

    if (workrequestId) {
      await documentService.addDocument({ workrequestId, fileRef });
    }

    return new UploadWorkrequestDocumentResult(fileRef);
  }

  @Mutation(returns => ModifyWorkRequestResult)
  async deleteWorkRequestDocument(
    @Ctx() ctx: GqlContext,
    @Arg("workRequestId", type => ObjectIDScalar) workrequestId: ObjectID,
    @Arg("fileId", type => ObjectIDScalar) fileId: ObjectID
  ): Promise<ModifyWorkRequestResult> {
    const service = ctx.container.get(WorkRequestDocumentService);
    const result = await service.removeDocument({ workrequestId, fileId });
    return new ModifyWorkRequestResult(result.workRequest, []);
  }

  @Mutation(() => ModifyWorkRequestResult)
  async closeWorkRequest(
    @Ctx() ctx: GqlContext,
    @Arg("workRequestId", () => ObjectIDScalar)
    workRequestId: ObjectID
  ) {
    const service = ctx.container.get(PublishWorkRequestService);
    const wr = await service.close(workRequestId);
    return new ModifyWorkRequestResult(wr.workRequest, []);
  }

  @Mutation(() => ModifyWorkRequestResult)
  async deleteWorkRequest(
    @Ctx() ctx: GqlContext,
    @Arg("workRequestId", () => ObjectIDScalar)
    workRequestId: ObjectID
  ) {
    const publishService = ctx.container.get(PublishWorkRequestService);
    const result = await publishService.delete(workRequestId);
    return new ModifyWorkRequestResult(result.workRequest, []);
  }

  @Mutation(() => ModifyWorkRequestResult)
  async updatePriorityWorkRequest(
    @Ctx() ctx: GqlContext,
    @Arg("workRequestId", () => ObjectIDScalar) workRequestId: ObjectID,
    @Arg("isPriority", () => Boolean, { defaultValue: false }) isPriority = false
  ) {
    const publishService = ctx.container.get(PublishWorkRequestService);
    const result = await publishService.setPriority(workRequestId, isPriority);
    return new ModifyWorkRequestResult(result.workRequest, []);
  }

  @Mutation(() => ModifyWorkRequestResult)
  async disableVacanciesInWorkRequest(
    @Ctx() ctx: GqlContext,
    @Arg("id", type => ObjectIDScalar) id: ObjectID,
    @Arg("weeks", type => [WeekYearInput]) weeks: WeekYearInput[]
  ) {
    const service = ctx.container.get(VacancyWorkRequestService);
    const result = await service.disableVacancies({
      workrequestId: id,
      weeks: weeks.map(x => ({ year: x.Year, week: x.Week }))
    });
    return new ModifyWorkRequestResult(result.workRequest, []);
  }

  @Mutation(() => ModifyWorkRequestResult)
  async changeVacanciesInWorkRequest(
    @Ctx() ctx: GqlContext,
    @Arg("id", type => ObjectIDScalar) id: ObjectID,
    @Arg("input", type => [ChangeVacanciesInWeekInput])
    input: ChangeVacanciesInWeekInput[]
  ) {
    const service = ctx.container.get(VacancyWorkRequestService);
    const result = await service.changeVacancies({
      workrequestId: id,
      weeks: input.map(x => ({
        week: x.weekYear.Week,
        year: x.weekYear.Year,
        byAmount: x.changeBy
      }))
    });
    return new ModifyWorkRequestResult(result.workRequest, []);
  }

  @Mutation(() => WorkRequestEvent)
  async workRequestAddEventLog(
    @Ctx() ctx: GqlContext,
    @Arg("workRequestId", type => ObjectIDScalar) workRequestId: ObjectID,
    @Arg("input", type => WorkRequestEventInput)
    input: WorkRequestEventInput
  ) {
    const service = ctx.container.get(WorkRequestServiceNew);
    const wra = await service.getByWorkRequestId(workRequestId);

    const event = new Domain.WorkRequestEvent.CommentEvent(
      workRequestId,
      Domain.UserRef.FromUserCtx(ctx.userProfile)
    );

    event.description = input.description;

    wra.workRequest.wrEventLog.add(event);

    await service.persist(wra);

    return event;
  }

  @Mutation(() => WorkRequestEvent)
  async workRequestUpdateEventLog(
    @Ctx() ctx: GqlContext,
    @Arg("workRequestId", type => ObjectIDScalar) workRequestId: ObjectID,
    @Arg("input", type => WorkRequestEventInput)
    input: WorkRequestEventInput
  ) {
    const service = ctx.container.get(WorkRequestServiceNew);
    const wra = await service.getByWorkRequestId(workRequestId);

    const userRef = UserRef.FromUserCtx(ctx.userProfile);
    const event = wra.workRequest.wrEventLog.getById(input._id);

    event.description = input.description ?? event.description;
    event.sticky = input.sticky ?? event.sticky;
    event.deleted = input.deleted ?? event.deleted;

    if (input.deleted) {
      event.audit.push(AuditItem.MakeDeleted(userRef));
    } else {
      event.audit.push(AuditItem.MakeUpdated(userRef));
    }

    wra.workRequest.wrEventLog.update(event);

    await service.persist(wra);

    return event;
  }
}
