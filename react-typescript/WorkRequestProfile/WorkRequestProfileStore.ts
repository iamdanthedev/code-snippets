import { action, computed, observable, toJS } from "mobx";
import {
  ChangeVacanciesInWorkrequest,
  DisableVacanciesInWorkRequest,
  WorkRequestProfileFragment,
  WorkRequestWeekParam,
  WorkRequestEditor_Upload_Document,
  WorkRequestProfile_Get,
  WorkRequestEditor_Get,
  WorkRequestProfile_Delete_Document,
  WorkRequestTableSearch_Fetch,
  WorkRequestBasicSearch_Fetch
} from "@graphql";
import { store } from "@store";
import { dateToWeekYear1, durationsToWeeks } from "~/common";

export class WorkRequestProfileStore {
  @observable filesToUpload: File[] = [];
  @observable isLoadingVacancies = false;
  @observable tab = "information";

  @observable private _selectedDurations: Duration[] = [];

  constructor(
    public readonly workrequestId,
    public readonly data: WorkRequestProfileFragment
  ) {
    (window as any).workRequestProfileStore = this;
  }

  @computed get selectedWeeksCells() {
    return this._selectedDurations;
  }

  @action.bound handleTabChange = (value: string) => {
    this.tab = value;
  };

  @action.bound setSelectedWeeksCells(durations: Duration[]) {
    this._selectedDurations = durations;
  }

  @action.bound increaseVacancies() {
    this.changeVacancies(1);
  }

  @action.bound decreaseVacancies() {
    this.changeVacancies(-1);
  }

  @action.bound disabledVacancies() {
    this.isLoadingVacancies = true;

    DisableVacanciesInWorkRequest.func(
      {
        id: this.workrequestId,
        input: this.selectedWeeks().map(x => ({ Week: x.week, Year: x.year }))
      },
      {
        refetchQueries: [
          WorkRequestProfile_Get.OperationName,
          WorkRequestTableSearch_Fetch.OperationName,
          WorkRequestBasicSearch_Fetch.OperationName
        ]
      }
    )
      .then(() => {
        store().snackbars.success("OK");
      })
      .catch(() => {
        store().snackbars.error("Cannot update vacancies");
      })
      .finally(() => {
        this.isLoadingVacancies = false;
      });
  }

  @action.bound closeUpload() {
    this.filesToUpload = [];
  }

  @action.bound deleteDoc(doc) {
    WorkRequestProfile_Delete_Document.func(
      { fileId: doc.FileRef.NodeID, id: this.workrequestId },
      {
        refetchQueries: [WorkRequestProfile_Get.OperationName]
      }
    );
  }

  @action.bound async upload() {
    if (this.filesToUpload.length === 0) {
      return;
    }

    for (const file of this.filesToUpload) {
      await WorkRequestEditor_Upload_Document.func(
        { id: this.workrequestId, file },
        {
          refetchQueries: [
            WorkRequestProfile_Get.OperationName,
            WorkRequestEditor_Get.OperationName
          ]
        }
      );
    }
  }

  @action.bound private changeVacancies(byNumber: number) {
    this.isLoadingVacancies = true;

    ChangeVacanciesInWorkrequest.func(
      {
        id: this.workrequestId,
        input: this.selectedWeeks().map(x => ({
          weekYear: { Year: x.year, Week: x.week },
          changeBy: byNumber
        }))
      },
      {
        refetchQueries: [
          WorkRequestProfile_Get.OperationName,
          WorkRequestTableSearch_Fetch.OperationName,
          WorkRequestBasicSearch_Fetch.OperationName
        ]
      }
    )
      .then(() => {
        store().snackbars.success("OK");
      })
      .catch(err => {
        store().snackbars.error("Cannot update vacancies");
      })
      .finally(() => {
        this.isLoadingVacancies = false;
      });
  }

  private selectedWeeks() {
    return durationsToWeeks(this._selectedDurations).map(x => dateToWeekYear1(x));
  }
}
