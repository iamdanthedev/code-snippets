import { ObjectID } from "bson";
import { cloneDeep, compact, isArray, isEmpty, xor } from "lodash";
import { dateToWeekYear1, durationsToWeeks1 } from "~/common";
import { InvalidUserInputError } from "~/common/errors";
import {
  Booking,
  BookingGroup,
  BookingInvoiceFormData,
  Consultant,
  CostCenter,
  Customer,
  CustomerRef,
  Invoice,
  Project,
  ProjectStatus,
  TimeReportStatus,
  UserRef,
  Workplace,
  WorkRequest,
  WorkRequestApplication,
  WorkRequestDuration,
  WorkRequestSearch,
  WorkRequestStatus,
  WorkRequestWeekParam
} from "~/Domain/types";
import { ConsultantRef, NodeRef } from "~/Domain/ref";
import { BookingEvent } from "~/Domain/types/EventLog/BookingEvent";
import { BookingSystemEvents, WorkRequestDurationType } from "~/Shared/Enums";
import { normalizeSearchField } from "~/Domain/utils";

import { BookingInvoiceFormEntity } from "./entity/BookingInvoiceFormEntity";
import { VacanciesByWeeksFactory } from "./factory/VacanciesByWeeksFactory";
import { WorkRequestStatusController } from "./utils/WorkRequestStatusController";
import { BookingCannotBeRemovedReason } from "./utils";

export class WorkRequestAggregate {
  static Create(
    workRequest: WorkRequest,
    projects: Project[],
    hospital: Customer,
    departments: Customer[],
    consultants: Consultant[],
    invoices: Invoice[],
    isNew: boolean
  ): WorkRequestAggregate {
    const aggregate = new WorkRequestAggregate(workRequest);

    aggregate._isNew = isNew;
    aggregate._hospital = hospital;
    aggregate._departments = departments;
    aggregate._projects = projects;
    aggregate._consultants = consultants;
    aggregate._invoices = invoices;

    if (isNew) {
      aggregate._workRequest.vacanciesByWeeks = VacanciesByWeeksFactory.Create(
        workRequest.duration
      );
    }

    return aggregate;
  }

  private _isNew = true;
  private readonly _workRequest: WorkRequest;
  private _consultants: Consultant[];
  private _hospital: Customer;
  private _departments: Customer[];
  private _projects: Project[];
  private _invoices: Invoice[];

  private statusController = new WorkRequestStatusController(() => this.close());

  private constructor(workRequest: WorkRequest) {
    this._workRequest = workRequest;
  }

  get id() {
    return this._workRequest._id;
  }

  get isNew() {
    return this._isNew;
  }

  get workRequest() {
    return this._workRequest;
  }

  get bookings() {
    return this._workRequest.bookings;
  }

  get bookedNonCanceledWeeks() {
    return this.bookings.filter(x => !x.canceled).map(x => x.week);
  }

  get bookingGroups() {
    return this._workRequest.bookingGroups;
  }

  get customerNumbers() {
    return this.bookings
      .map(x => x.customerNumber)
      .compact()
      .unique();
  }

  get customer() {
    return this._hospital;
  }

  get customerId() {
    return this._workRequest.workplace?.customerRef?.Id;
  }

  get customerRef() {
    return this._workRequest.workplace?.customerRef;
  }

  // unpaid bookings
  get openBookings() {
    return this.bookings.filter(x => x.isOpen);
  }

  get unCanceledOpenBookings() {
    return this.bookings.filter(x => !x.canceled && x.isOpen);
  }

  get isDirect() {
    return !!this._workRequest.isDirect;
  }

  get departmentIds() {
    return this._departments.map(x => x._id);
  }

  get departmentsNames() {
    return this._departments.map(x => x.Name).join(", ");
  }

  get departments() {
    return this._departments;
  }

  get departmentRefs() {
    return this._workRequest.workplace?.departmentRefs ?? [];
  }

  get durationWeeks() {
    if (isEmpty(this._workRequest.duration)) {
      return [];
    }

    return durationsToWeeks1(this._workRequest.duration);
  }

  get durationType() {
    return this._workRequest.durationType;
  }

  get durationCustomText() {
    return this._workRequest.durationCustomText;
  }

  get isPublished() {
    return this._workRequest.status === WorkRequestStatus.Published;
  }

  get status() {
    return this._workRequest.status;
  }

  delete(userRef: UserRef) {
    if (this.hasActiveBookings()) {
      throw new Error("cannot delete workrequest with bookings");
    }

    this._workRequest.setDeleted(userRef);
  }

  setDraft() {
    if (this.hasActiveBookings()) {
      throw new Error("Cannot set workrequest to draft: has active bookings");
    }

    this._workRequest.status = WorkRequestStatus.Draft;
  }

  setPriority(value: boolean) {
    this._workRequest.isPriority = Boolean(value);
  }

  hasOpenBookings() {
    return this.bookings.filter(x => x.isOpen).length > 0;
  }

  hasOpenVacancies(): boolean {
    return !!this._workRequest.vacanciesByWeeks.find(
      x => x.openVacancies > 0 && !x.isDisabled
    );
  }

  hasAnyBookings() {
    return this.bookings.length > 0;
  }

  hasActiveBookings() {
    return this.bookings.filter(x => !x.isCanceled).length > 0;
  }

  hasNonOpenBookings() {
    return this.bookings.filter(x => !x.isOpen).length > 0;
  }

  hasBooking(id: ObjectID) {
    return this.bookings.any(x => x._id.equals(id));
  }

  hasBookingGroup(id: ObjectID) {
    return !!this.bookingGroups.find(x => x._id.equals(id));
  }

  getBooking(id: ObjectID) {
    return this.bookings.find(x => x._id.equals(id));
  }

  getBookingsByBookingGroup(bookingGroupId: ObjectID) {
    return this.bookings.filter(x => x.bookingGroupId.equals(bookingGroupId));
  }

  getBookingOrThrow(id: ObjectID) {
    const booking = this.bookings.find(x => x._id.equals(id));

    if (!booking) {
      throw new Error(`cannot find booking ${id}`);
    }

    return booking;
  }

  getBookingGroupByBookingId(id: ObjectID) {
    const booking = this.getBooking(id);
    return this.bookingGroups.find(x => x._id.equals(booking.bookingGroupId));
  }

  getBookingByAccommodationRequestId(requestId: ObjectID) {
    return this.bookings.find(booking =>
      booking.accommodationRequests.any(x => x._id.equals(requestId))
    );
  }

  getBookingByTravelRequestId(requestId: ObjectID) {
    return this.bookings.find(booking =>
      booking.travelRequests.any(x => x._id.equals(requestId))
    );
  }

  getBookingsByConsultantId(consultantId: ObjectID) {
    return this.bookings.filter(x => x.consultantId.equals(consultantId));
  }

  getBookingConsultant(bookingId: ObjectID) {
    const booking = this.getBookingOrThrow(bookingId);

    if (!booking.consultantId) {
      return null;
    }

    const consultant = this._consultants.find(x => x._id.equals(booking.consultantId));

    if (!consultant) {
      throw new Error(`cannot find consultant ${booking.consultantId}`);
    }

    return consultant;
  }

  getBookingGroup(id: ObjectID) {
    return this.bookingGroups.find(x => x._id.equals(id));
  }

  getBookingInvoices(bookingId: ObjectID) {
    const booking = this.getBookingOrThrow(bookingId);

    return booking.customerInvoicing.invoiceNumbers.map(invoiceNumber => {
      const invoice = this._invoices.find(x => x.InvoiceNumber === invoiceNumber);

      if (!invoiceNumber) {
        throw new Error(`cannot find invoice number ${invoiceNumber}`);
      }

      return invoice;
    });
  }

  getBookingProject(bookingId: ObjectID) {
    const booking = this.getBookingOrThrow(bookingId);

    if (!booking.projectId) {
      return null;
    }

    const project = this._projects.find(x => x._id.equals(booking.projectId));

    if (!project) {
      throw new Error(`cannot find project ${booking.projectId}`);
    }

    return project;
  }

  getBookingGroupCancellableReason(bookingGroupId: ObjectID) {
    const bookings = this.getBookingsInBookingGroup(bookingGroupId);

    for (const booking of bookings) {
      if (!booking.isOpen) {
        return "Denna bokningsgruppen kan inte avbokas då någon av veckorna i bokningsgruppen är hanterad av ekonomiavdelningen.";
      } else if (
        booking.timeReportStatus != TimeReportStatus.Blank &&
        booking.timeReportStatus != null
      ) {
        return "Denna bokningsgruppen kan inte avbokas då det finns en påbörjad tidrapport på någon av veckorna i bokningsgruppen.";
      }

      return "";
    }
  }

  getBookingGroupIsCancellable(bookingGroupId: ObjectID) {
    const bookings = this.getBookingsInBookingGroup(bookingGroupId);

    for (const booking of bookings) {
      if (!booking.isCancellable) {
        return false;
      }
    }

    return true;
  }

  getBookingsInBookingGroup(bookingGroupId: ObjectID) {
    return this.bookings.filter(x => x.isInBookingGroup(bookingGroupId));
  }

  getBookingsInBookingGroupFilterByWeeks(bookingGroupId: ObjectID, weeks: Date[]) {
    return this.getBookingsInBookingGroup(bookingGroupId)
      .filter(x => x.isOpen)
      .filter(x => inDateArray(weeks, x.week));
  }

  addBookingGroup(
    bookingGroup: BookingGroup,
    bookings: Booking[],
    projects: Project[],
    consultants: Consultant[]
  ) {
    this.assertBookingGroupNotExist(bookingGroup._id);
    assertBookingsInGroup(bookingGroup._id, bookings);
    assertConsultantProvided(bookings, consultants);
    assertProjectProvided(bookings, projects);
    assertProjectsNotCompleted(projects);

    this._workRequest.bookingGroups.push(bookingGroup);
    this._workRequest.bookings.push(...bookings);
    this._addConsultants(consultants);
    this._addProjects(projects);
    this._reduceVacanciesInWeeks(bookings.map(x => x.week));
    this.statusController.closeIfFullyBooked(
      this.workRequest.duration,
      this.workRequest.bookings
    );
  }

  addBookingsToBookingGroup(
    bookingGroupId: ObjectID,
    bookings: Booking[],
    projects: Project[],
    consultants: Consultant[]
  ) {
    if (!this.hasBookingGroup(bookingGroupId)) {
      throw new Error(`booking group ${bookingGroupId} doesn't exist`);
    }

    if (bookings.any(x => !x.bookingGroupId.equals(bookingGroupId))) {
      throw new Error("invalid booking group");
    }

    this.bookings.push(...bookings);
    this._addProjects(projects);
    this._addConsultants(consultants);
    this._reduceVacanciesInWeeks(bookings.map(x => x.week));
    this.statusController.closeIfFullyBooked(
      this.workRequest.duration,
      this.workRequest.bookings
    );
  }

  addConsultantApplication(consultantRef: NodeRef) {
    if (this.hasConsultantApplication(consultantRef.NodeID)) {
      throw new Error("application already exists");
    }

    const application = new WorkRequestApplication(new Date(), consultantRef);
    this.workRequest.applications.push(application);
    return application;
  }

  hasConsultantApplication(consultantId: ObjectID) {
    return this.workRequest.applications.any(x =>
      x.consultantRef.NodeID.equals(consultantId)
    );
  }

  getConsultantApplication(consultantId: ObjectID) {
    return this.workRequest.applications.find(x =>
      x.consultantRef.NodeID.equals(consultantId)
    );
  }

  getVacantDurations() {
    return VacanciesByWeeksFactory.VacanciesAsDurations(
      this._workRequest.vacanciesByWeeks
    );
  }

  changeExpertise(areaOfExpertise: string, specializations: string[]) {
    this._workRequest.areaOfExpertise = areaOfExpertise;
    this._workRequest.specializations = specializations || [];
    this.openBookings.forEach(booking => booking.setAreaOfExpertise(areaOfExpertise));
  }

  changeCostCenter(costCenter: CostCenter) {
    this.openBookings.forEach(booking => booking.setCostCenter(costCenter));
  }

  close() {
    this.workRequest.status = WorkRequestStatus.Closed;
  }

  publish() {
    if (this.workRequest.status === WorkRequestStatus.Published) {
      throw new Error("work request was published earlier");
    }

    this.workRequest.status = WorkRequestStatus.Published;
    this.workRequest.publishedOn = new Date();
  }

  setBookingConsultant(bookingId: ObjectID, consultant: Consultant) {
    if (!this.hasBooking(bookingId)) {
      throw new Error(`booking ${bookingId} not found`);
    }

    const booking = this.getBookingOrThrow(bookingId);

    if (!booking.isOpen) {
      throw new Error(`cannot change consultant on a closed booking`);
    }

    if (booking.isCanceled) {
      throw new Error(`cannot change consultant on a canceled booking`);
    }

    booking.setConsultantRef(ConsultantRef.Create(consultant));
    if (!this._consultants.any(x => x._id.equals(consultant._id))) {
      this._consultants.push(consultant);
    }
  }

  // set booking accommodationRequired
  setBookingAcc(bookingId: ObjectID, accRequired: boolean, userRef: UserRef) {
    const booking = this.getBookingOrThrow(bookingId);
    booking.accommodationRequired = accRequired;
    // does not affect to approve to avoid side effect when edit group
    booking.accommodationAudit?.updateOnlyUserInfo(userRef);

    const event = new BookingEvent.SystemEvent({
      bookingId,
      userRef,
      description: BookingSystemEvents.UpdateAccStatus,
      resultOfAction: this.workRequest.getBookingAccommodationStatus(bookingId)
    });
    this.workRequest.addEventLog(event);
  }

  setBookingTravelRequired(
    bookingId: ObjectID,
    travelRequired: boolean,
    userRef: UserRef
  ) {
    const booking = this.getBookingOrThrow(bookingId);
    booking.travelRequired = travelRequired;
    // does not affect to approve to avoid side effect when edit group
    booking.travelAudit?.updateOnlyUserInfo(userRef);

    const event = new BookingEvent.SystemEvent({
      bookingId,
      userRef,
      description: BookingSystemEvents.UpdateTravelStatus,
      resultOfAction: this.workRequest.getBookingTravelStatus(bookingId)
    });
    this.workRequest.addEventLog(event);
  }

  setWorkplace(workPlace: Workplace) {
    if (this.hasNonOpenBookings()) {
      throw new InvalidUserInputError(
        "Cannot change customer on a work request that has closed bookings"
      );
    }
    this._workRequest.setWorkplace(workPlace);
  }

  setExactDuration(duration: WorkRequestDuration[]) {
    const prevDuration = cloneDeep(this._workRequest.duration);

    this._workRequest.durationType = WorkRequestDurationType.Exact;
    this._workRequest.duration = duration;
    this._workRequest.durationCustomText = "";
    this.setVacancies(
      VacanciesByWeeksFactory.ChangeByNewDurations(
        this._workRequest.vacanciesByWeeks,
        prevDuration,
        duration
      )
    );
  }

  setContinuousDuration() {
    this._workRequest.durationType = WorkRequestDurationType.Continuous;
    this._workRequest.duration = [];
    this._workRequest.durationCustomText = "";
    this.setVacancies([]);
  }

  setAgreementDuration() {
    this._workRequest.durationType = WorkRequestDurationType.Agreement;
    this._workRequest.duration = [];
    this._workRequest.durationCustomText = "";
    this.setVacancies([]);
  }

  setCustomDuration(text: string) {
    this._workRequest.durationType = WorkRequestDurationType.Custom;
    this._workRequest.duration = [];
    this._workRequest.durationCustomText = text || "";
    this.setVacancies([]);
  }

  changeProject(project: Project) {
    this.openBookings.forEach(booking => booking.setProject(project));
  }

  changeVacanciesInWeek(week: number, year: number, change: number) {
    const v = VacanciesByWeeksFactory.ChangeInWeek(
      this._workRequest.vacanciesByWeeks,
      week,
      year,
      change
    );
    this.setVacancies(v);
  }

  triggerWeeksDisabled(week: number, year: number) {
    this.setVacancies(
      VacanciesByWeeksFactory.TriggerWeek(this._workRequest.vacanciesByWeeks, week, year)
    );
  }

  setBookingProject(bookingId: ObjectID, project: Project) {
    const booking = this.getBookingOrThrow(bookingId);
    booking.setProject(project);
    this._addProjects([project]);
  }

  addBookingInvoice(bookingId: ObjectID, invoice: Invoice) {
    const booking = this.getBookingOrThrow(bookingId);
    booking.customerInvoicing.addInvoiceNumber(invoice.InvoiceNumber);
    this._addInvoices([invoice]);
  }

  setAreaOfExpertise(value: string) {
    this._workRequest.areaOfExpertise = value;
    this.openBookings.forEach(booking => booking.setAreaOfExpertise(value));
  }

  isBookingRemovable(bookingId: ObjectID): BookingCannotBeRemovedReason[] | true {
    // cannot be removed if a booking has
    // 1) documents
    // 2) invoice number
    // 3) is consultant paid
    // 4) is customer billed
    const booking = this.getBookingOrThrow(bookingId);
    const reasons: BookingCannotBeRemovedReason[] = [];

    if (booking.customerInvoicing.invoiceNumbers.length > 0) {
      reasons.push(BookingCannotBeRemovedReason.HasInvoiceNumber);
    }

    if (booking.isConsultantPayed) {
      reasons.push(BookingCannotBeRemovedReason.ConsultantPaid);
    }

    if (booking.isCustomerBilled) {
      reasons.push(BookingCannotBeRemovedReason.CustomerBilled);
    }

    return reasons.length > 0 ? reasons : true;
  }

  isCustomerSame(customerId: ObjectID, departmentIds: ObjectID[]) {
    if (!this.customerId?.equals(customerId)) {
      return false;
    }

    return compareObjectIds(this.departmentIds, departmentIds);
  }

  isExpertiseSame(areaOfExpertise: string, specializations: string[]) {
    if (!areaOfExpertise || !isArray(specializations)) {
      return false;
    }

    const aoeIsSame = areaOfExpertise === this.workRequest.areaOfExpertise;
    const specsIsSame =
      xor(specializations, this.workRequest.specializations).length === 0;

    return aoeIsSame && specsIsSame;
  }

  cancelBooking(bookingId: ObjectID, reason: string, userRef: UserRef) {
    const booking = this.getBookingOrThrow(bookingId);

    if (booking.isCanceled) {
      throw new InvalidUserInputError("booking was canceled previously");
    }

    if (!isEmpty(booking.customerInvoicing.invoiceNumbers)) {
      throw new InvalidUserInputError("invoiced bookings cannot be canceled");
    }

    if (booking.isCustomerBilled || booking.isConsultantPayed) {
      throw new InvalidUserInputError(
        "cannot cancel a booking that has been invoiced/payed"
      );
    }

    booking.cancel(reason, userRef);

    const wy = dateToWeekYear1(booking.week);
    this.changeVacanciesInWeek(wy.week, wy.year, 1);
    // system log canceling

    const event = new BookingEvent.SystemEvent({
      bookingId,
      userRef,
      description: BookingSystemEvents.Canceled,
      resultOfAction: reason
    });
    this.workRequest.addEventLog(event);
  }

  cancelBookingsOnWeeks(bookingsToCancel: Booking[], reason: string, userRef: UserRef) {
    bookingsToCancel.forEach(booking => this.cancelBooking(booking._id, reason, userRef));
  }

  async setInvoiceForm(bookingId: ObjectID, invoice: BookingInvoiceFormEntity) {
    const bookingGroup = this.getBookingGroupByBookingId(bookingId);
    const bookings = this.getBookingsInBookingGroup(bookingGroup._id);

    bookings.forEach(booking => {
      let invoiceForm: BookingInvoiceFormData;

      if (booking._id.equals(bookingId)) {
        invoiceForm = invoice.serialize();
      } else {
        const entity = booking.hasInvoiceForm
          ? BookingInvoiceFormEntity.CreateFromExistingWithoutFragments(
              booking.invoiceForm
            )
          : BookingInvoiceFormEntity.CreateNewWithoutFragments();
        entity.cloneDataFromEntity(invoice);
        invoiceForm = entity.serialize();
      }

      booking.setInvoiceForm(invoiceForm);
    });
  }

  getWorkRequestSearch(): WorkRequestSearch {
    const searchArray = [`Status: ${this._workRequest.status}`];
    const searchField = normalizeSearchField(
      ...(this._hospital && this._hospital.Search
        ? this._hospital.Search.SearchField
        : []),
      ...(this._departments ? this._departments.flatMap(x => x.Search.SearchField) : []),
      this.workRequest.basis?.subject,
      this.workRequest.basis?.from,
      this.workRequest.basis?.messageId
    );

    if (this._workRequest.areaOfExpertise) {
      searchArray.push(this._workRequest.areaOfExpertise);
    }

    if (Array.isArray(this._workRequest.specializations)) {
      searchArray.push(...this._workRequest.specializations);
    }

    searchArray.push(`ShowInApp: ${Boolean(this._workRequest.showInApp)}`);
    searchArray.push(`IsDirect: ${Boolean(this.isDirect)}`);

    return {
      areaOfExpertise: this._workRequest.areaOfExpertise || "",
      durationWeeks: durationsToWeeks1(this._workRequest.duration, true),
      searchArray: searchArray.filter(x => x),
      searchField,
      startDateUtc: this._workRequest.getStartDate(),
      endDateUtc: this.workRequest.getEndDate(),
      address: this.customer?.Address
    };
  }

  changeCustomer(hospitalRef: CustomerRef, departmentRefs: CustomerRef[]) {
    if (this.hasNonOpenBookings()) {
      throw new InvalidUserInputError(
        "Cannot change customer on a work request that has closed bookings"
      );
    }

    this.workRequest.workplace.customerRef = hospitalRef;
    this.workRequest.workplace.departmentRefs = departmentRefs;
  }

  setVacancies(v: WorkRequestWeekParam[]) {
    this._workRequest.vacanciesByWeeks = compact(v);

    if (
      this._workRequest.durationType === WorkRequestDurationType.Exact &&
      !this.hasOpenVacancies()
    ) {
      this.close();
    }
  }

  private _addConsultants(consultants: Consultant[]) {
    this._consultants = [...this._consultants, ...consultants].uniqueBy(x =>
      x._id.toHexString()
    );
  }

  private _addInvoices(invoices: Invoice[]) {
    this._invoices = [...this._invoices, ...invoices].uniqueBy(x => x.InvoiceNumber);
  }

  private _addProjects(projects: Project[]) {
    this._projects = [...this._projects, ...projects].uniqueBy(x => x._id.toHexString());
  }

  private _reduceVacanciesInWeeks(weeks: Date[]) {
    const v = VacanciesByWeeksFactory.ReduceByOne(
      this._workRequest.vacanciesByWeeks,
      weeks
    );

    this.setVacancies(v);
  }

  private assertBookingGroupNotExist(bookingGroupId: ObjectID) {
    if (this.hasBookingGroup(bookingGroupId)) {
      throw new Error(
        `Booking group ${bookingGroupId} already exists in work request ${this.id}`
      );
    }
  }
}

function assertBookingsInGroup(bookingGroupId: ObjectID, bookings: Booking[]) {
  for (const booking of bookings) {
    if (!booking.bookingGroupId.equals(bookingGroupId)) {
      throw new Error(`invalid booking group id`);
    }
  }
}

function assertProjectProvided(bookings: Booking[], projects: Project[]) {
  if (bookings.any(x => x.projectId && !projects.find(p => p._id.equals(x.projectId)))) {
    throw new Error("missing project data");
  }
}

function assertConsultantProvided(bookings: Booking[], consultants: Consultant[]) {
  if (
    bookings.any(
      x => x.consultantId && !consultants.find(c => c._id.equals(x.consultantId))
    )
  ) {
    throw new Error("missing consultant data");
  }
}

function assertProjectsNotCompleted(projects: Project[]) {
  if (projects.any(x => x.Status === ProjectStatus.COMPLETED)) {
    throw new Error(`Cannot create a booking on completed project`);
  }
}

function inDateArray(arr: Date[], value: Date) {
  return arr.map(x => x.valueOf()).includes(value.valueOf());
}

function compareObjectIds(ids1: ObjectID[], ids2: ObjectID[]) {
  return isEmpty(
    xor(
      ids1.map(x => x.toHexString()),
      ids2.map(x => x.toHexString())
    )
  );
}
