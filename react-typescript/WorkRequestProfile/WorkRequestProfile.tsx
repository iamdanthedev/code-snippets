import { observable } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { Divider, Chip, Paper } from "@material-ui/core";
import { weeksToDurations } from "~/common";
import locale from "@locale";
import { store } from "@store";
import {
  WorkRequestProfileFragment as Data,
  WorkRequestProfile_Get,
  getObservableQuery,
  WorkRequestDurationType
} from "@graphql";
import {
  BookingProfileLocation,
  Navigation,
  WithNavigation,
  WorkRequestEditorLocation
} from "@navigation";
import { Actions, Body, PrimaryButton, Topbar } from "@components";
import DocumentList from "@containers/DocumentList/DocumentList";
import ProfileSection from "@components/ProfileSection";
import { ErrorBoundary } from "@components/ErrorBoundary";
import WorkRequestEventLog from "@containers/EventLog/WorkRequestEventLog/WorkRequestEventLog";
import DnDContainer from "@containers/DnDContainer/DnDContainer";
import { DocumentUploaderDialog } from "@containers/DocumentUploader/DocumentUploaderDialog";

import WorkRequestProfileLayout from "./WorkRequestProfileLayout";
import { VacanciesUpdater } from "./VacanciesUpdater/VacanciesUpdater";
import { WorkRequestProfileStore } from "./WorkRequestProfileStore";
import WorkRequestBookings from "../WorkRequestBookings/WorkRequestBookings";
import { WorkRequestDeduper } from "../WorkRequestDeduper/WorkRequestDeduper";
import { WorkRequestPeriods } from "../WorkRequestPeriods";
import { CreateBookingLocation } from "../locations/CreateBookingLocation";
import { GridWorkRequestCard } from "../WorkRequestCard/GridWorkRequestCard";
import { WorkRequestInfo } from "../WorkRequestInfo/WorkRequestInfo";

export type WorkRequestProfileProps = {
  id: string;
  data?: Data;
};

@observer
export class WorkRequestProfile extends React.Component<WorkRequestProfileProps> {
  @observable store = new WorkRequestProfileStore(this.props.id, this.props.data);

  componentDidUpdate(prevProps: WorkRequestProfileProps) {
    if (prevProps.data != this.props.data) {
      this.store = new WorkRequestProfileStore(this.props.id, this.props.data);
    }
  }

  render() {
    const { data } = this.props;

    return (
      <DnDContainer onDrop={accepted => (this.store.filesToUpload = accepted)}>
        <ErrorBoundary>
          <WorkRequestProfileLayout
            id={this.props.id}
            periods={this.renderPeriods(data)}
            card={this.renderCard()}
            eventLog={this.renderEventLog()}
            documentsTab={this.renderDocumentsTab}
            dupeTab={this.renderDupeTab}
            topBar={this.renderTopBar()}
            renderBookings={() => this.renderBookings()}
            renderInfo={() => this.renderInfo()}
          />
        </ErrorBoundary>
        <DocumentUploaderDialog
          canSubmit={true}
          files={this.store.filesToUpload}
          onClose={this.store.closeUpload}
          onUpload={this.store.upload}
        />
      </DnDContainer>
    );
  }

  private renderTopBar = () => {
    return <Topbar />;
  };

  private renderCard = () => {
    const { data } = this.store;

    return (
      <WithNavigation>
        {(navigation: Navigation) => (
          <GridWorkRequestCard
            item={data}
            onEdit={() =>
              navigation.navigate(new WorkRequestEditorLocation(this.props.id))
            }
          />
        )}
      </WithNavigation>
    );
  };

  private renderEventLog = () => {
    return (
      <Paper style={{ height: "100%" }}>
        <WorkRequestEventLog id={this.store.workrequestId} />
      </Paper>
    );
  };

  private renderInfo = () => {
    if (!this.store.data) {
      return null;
    }

    return <WorkRequestInfo data={this.store.data} />;
  };

  private renderDocumentsTab = () => {
    return (
      <DocumentList
        documents={this.props.data?.Documents || []}
        onDelete={this.store.deleteDoc}
      />
    );
  };

  private renderDupeTab = () => <WorkRequestDeduper workRequestId={this.props.id} />;

  private renderPeriods = (data: Data) => {
    if (data.WorkRequestDurationType === WorkRequestDurationType.Exact) {
      return (
        <ProfileSection collapsible={false}>
          <WorkRequestPeriods
            value={this.store.selectedWeeksCells}
            onChange={this.store.setSelectedWeeksCells}
            weekParams={this.store.data.WorkRequestWeeksParams}
            durations={data?.Duration || []}
            bookings={weeksToDurations(data?.Bookings?.map(x => x.From))}
            contentAfter={<VacanciesUpdater store={this.store} />}
          />
        </ProfileSection>
      );
    }

    if (data.WorkRequestDurationType === WorkRequestDurationType.Continuous) {
      return (
        <ProfileSection collapsible={false}>
          <ErrorBoundary>
            <Chip
              label={locale.workRequestDurationType[data.WorkRequestDurationType]}
              variant="outlined"
            />
          </ErrorBoundary>
        </ProfileSection>
      );
    }

    if (data.WorkRequestDurationType === WorkRequestDurationType.Agreement) {
      return (
        <ProfileSection collapsible={false}>
          <ErrorBoundary>
            <Chip
              label={locale.workRequestDurationType[data.WorkRequestDurationType]}
              variant="outlined"
            />
          </ErrorBoundary>
        </ProfileSection>
      );
    }

    if (data.WorkRequestDurationType === WorkRequestDurationType.Custom) {
      return (
        <ProfileSection collapsible={false}>
          <ErrorBoundary>
            <Body style={{ fontWeight: "bold" }} newlineToBr>
              {data.DurationCustomText || ""}
            </Body>
          </ErrorBoundary>
        </ProfileSection>
      );
    }
  };

  private renderBookings = () => {
    const { data } = this.store;
    const { navigation: storeNavigation } = store();

    return (
      <div>
        <WithNavigation>
          {(navigation: Navigation) => (
            <div>
              <Actions style={{ padding: 16 }}>
                <PrimaryButton
                  style={{ marginLeft: "auto" }}
                  onClick={() => {
                    const location = new CreateBookingLocation({
                      WorkRequestId: data._id,
                      HospitalRef: {
                        label: data.HospitalRef.Name,
                        value: data.HospitalRef.Id
                      },
                      DepartmentsRefs: data.DepartmentsRefs.map(x => x.Id),
                      AreaOfExpertise: data.AreaOfExpertise,
                      Specializations: data.Specializations
                    });

                    storeNavigation.open("BOOKING_SLIDER", location).afterClose.on(() => {
                      getObservableQuery(
                        WorkRequestProfile_Get.OperationName
                      ).observableQuery?.refetch();
                    });
                  }}
                >
                  {locale["Add new booking"]}
                </PrimaryButton>
              </Actions>

              <Divider />

              <WorkRequestBookings
                data={data}
                onOpenBooking={id => {
                  navigation.navigate(new BookingProfileLocation(id));
                }}
              />
            </div>
          )}
        </WithNavigation>
      </div>
    );
  };
}
