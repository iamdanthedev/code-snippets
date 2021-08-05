import { inject, injectable } from "inversify";
import { Controller, OperationId, Post, Route, Security, Tags } from "tsoa";
import { ObjectID } from "bson";
import { ConsultantAppSettingsRepository } from "~/Domain/repository";
import { WorkRequestBookmark } from "~/Domain/types/ConsultantAppSettingsDocument";
import { IUserContext, IUserContextType } from "~/Shared/interface";
import { ConsultantBookmarkedWorkrequestEvent } from "@bonliva/message-bus";
import { IMessageSender, IMessageSenderType } from "~/Service";

class BookmarkWorkrequestResult {
  ok: boolean;
}

@Route("api/consultant-app/v1/bookmark-job")
@injectable()
export class JobBookmarkController extends Controller {
  constructor(
    @inject(ConsultantAppSettingsRepository)
    private consultantAppSettingsRepository: ConsultantAppSettingsRepository,
    @inject(IUserContextType) private userContext: IUserContext,
    @inject(IMessageSenderType) private messageSender: IMessageSender
  ) {
    super();
  }

  @Security("custom", ["Consultant"])
  @Post("{workrequestId}")
  @OperationId("bookmarkJob")
  @Tags("ConsultantAppV1")
  public async bookmarkJob(
    @Route() workrequestId: string
  ): Promise<BookmarkWorkrequestResult> {
    const id = ObjectID.createFromHexString(workrequestId);
    const consultantId = this.userContext._id;
    const bookmarks = await this.consultantAppSettingsRepository.getField(
      consultantId,
      "workRequestBookmarks"
    );

    let result: WorkRequestBookmark[];
    let isBookmarked = true;

    if (bookmarks.any(x => x.workrequestId.equals(id))) {
      result = bookmarks.filter(x => !x.workrequestId.equals(id));
      isBookmarked = false;
    } else {
      result = bookmarks.concat({
        _id: new ObjectID(),
        workrequestId: id,
        createdOn: new Date()
      });
    }

    await this.consultantAppSettingsRepository.setField(
      consultantId,
      "workRequestBookmarks",
      result
    );

    const consultantBookmarkedWorkrequestEvent = new ConsultantBookmarkedWorkrequestEvent(
      {
        workRequestId: workrequestId,
        consultantId: consultantId.toHexString(),
        isBookmarked
      }
    );

    await this.messageSender.send(consultantBookmarkedWorkrequestEvent);

    return { ok: true };
  }
}
