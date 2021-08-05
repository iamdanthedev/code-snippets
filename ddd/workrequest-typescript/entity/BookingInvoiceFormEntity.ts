import { ObjectID } from "bson";
import {
  BookingInfoFragment,
  BookingInvoiceForm,
  BookingInvoiceFormBillingData,
  BookingInvoiceFormData,
  BookingInvoiceFormStatus,
  WorkRequestInfoFragment,
  YesNo
} from "~/Domain/types";

export class BookingInvoiceFormEntity {
  static CreateFromExisting(data: BookingInvoiceForm): BookingInvoiceFormEntity {
    return new BookingInvoiceFormEntity(data);
  }

  static CreateFromExistingWithoutFragments(
    data: BookingInvoiceFormData
  ): BookingInvoiceFormEntity {
    return new BookingInvoiceFormEntity(data as BookingInvoiceForm);
  }

  static CreateNew(
    bookingInfo: BookingInfoFragment,
    workRequestInfo: WorkRequestInfoFragment
  ): BookingInvoiceFormEntity {
    const data: BookingInvoiceForm = BookingInvoiceFormEntity.CreateBookingsFormInvoiceData(
      bookingInfo,
      workRequestInfo
    );
    const entity: BookingInvoiceFormEntity = new BookingInvoiceFormEntity(data);
    return entity;
  }

  static CreateNewWithoutFragments(): BookingInvoiceFormEntity {
    const data: BookingInvoiceForm = BookingInvoiceFormEntity.CreateBookingsFormInvoiceData(
      null,
      null
    );
    const entity: BookingInvoiceFormEntity = new BookingInvoiceFormEntity(data);
    entity.id = new ObjectID();
    return entity;
  }

  static CreateBookingsFormInvoiceData(
    bookingInfo: BookingInfoFragment,
    workRequestInfo: WorkRequestInfoFragment
  ): BookingInvoiceForm {
    return {
      _id: null,
      Version: 0,
      Period: "",
      Order: "",
      CVU: "",
      ClientName: "",
      ContractNumber: "",
      Timesheet: YesNo.No,
      LowTB: "",

      BillingsData: [],
      ConsolidatedInvoice: YesNo.No,

      Note: "",
      AdminFee: "",

      Trip: 0,
      Accommodation: 0,

      ...bookingInfo,
      ...workRequestInfo
    };
  }

  private _data: BookingInvoiceForm | null = null;

  constructor(private readonly _bookingInvoiceFormData: BookingInvoiceForm) {
    this._data = _bookingInvoiceFormData;
  }

  get data(): BookingInvoiceForm {
    return this._data;
  }

  serialize(): BookingInvoiceFormData {
    return {
      _id: this.id,
      Version: this.version,
      Period: this.period,
      ConsolidatedInvoice: this.consolidatedInvoice,
      Order: this.order,
      CVU: this.cvu,
      ClientName: this.clientName,
      ContractNumber: this.contractNumber,
      Timesheet: this.timesheet,
      LowTB: this.lowTB,
      BillingsData: this.billingsData,
      Note: this.note,
      AdminFee: this.adminFee,
      Trip: this.trip,
      Accommodation: this.accommodation
    };
  }

  get id(): ObjectID {
    if (this.status === BookingInvoiceFormStatus.New) {
      return null;
    } else {
      return this._data._id;
    }
  }

  set id(_id: ObjectID) {
    this._data._id = _id;
  }

  get nextVersion(): number | null {
    if (this.status !== BookingInvoiceFormStatus.OnlyView) {
      return this._data.Version + 1;
    } else {
      return null;
    }
  }

  get version(): number {
    return this._data.Version;
  }

  set version(_version: number) {
    if (_version < this.nextVersion) {
      throw new Error(`Version smaller than current version: ${this.version}`);
    } else {
      this._data.Version = _version;
    }
  }

  get status(): BookingInvoiceFormStatus {
    if (this._data.BookingIsClosed) {
      return BookingInvoiceFormStatus.OnlyView;
    } else if (this._data._id) {
      return BookingInvoiceFormStatus.Editable;
    } else {
      return BookingInvoiceFormStatus.New;
    }
  }

  get period(): string {
    return this._data.Period;
  }

  set period(_period: string) {
    this._data.Period = _period;
  }

  get consolidatedInvoice(): YesNo {
    return this._data.ConsolidatedInvoice;
  }

  set consolidatedInvoice(_consolidatedInvoice: YesNo) {
    this._data.ConsolidatedInvoice = _consolidatedInvoice;
  }

  get order(): string {
    return this._data.Order;
  }

  set order(_order: string) {
    this._data.Order = _order;
  }

  get cvu(): string {
    return this._data.CVU;
  }

  set cvu(_cvu: string) {
    this._data.CVU = _cvu;
  }

  get clientName(): string {
    return this._data.ClientName;
  }

  set clientName(_clientName: string) {
    this._data.ClientName = _clientName;
  }

  get contractNumber(): string {
    return this._data.ContractNumber;
  }

  set contractNumber(_contractNumber: string) {
    this._data.ContractNumber = _contractNumber;
  }

  get timesheet(): YesNo {
    return this._data.Timesheet;
  }

  set timesheet(_timesheet: YesNo) {
    this._data.Timesheet = _timesheet;
  }

  get lowTB(): string {
    return this._data.LowTB;
  }

  set lowTB(_lowTB: string) {
    this._data.LowTB = _lowTB;
  }

  get billingsData(): BookingInvoiceFormBillingData[] {
    return this._data.BillingsData ? this._data.BillingsData : [];
  }

  set billingsData(_billingsData: BookingInvoiceFormBillingData[]) {
    this._data.BillingsData = _billingsData;
  }

  get note(): string {
    return this._data.Note;
  }

  set note(_note: string) {
    this._data.Note = _note;
  }

  get adminFee(): string {
    return this._data.AdminFee;
  }

  set adminFee(_adminFee: string) {
    this._data.AdminFee = _adminFee;
  }

  get areaOfExpertise(): string {
    return this._data.AreaOfExpertise;
  }

  get week(): number {
    return this._data.Week;
  }

  get year(): number {
    return this._data.Year;
  }

  get customerNumber(): string {
    return this._data.CustomerNumber;
  }

  get projectNumber(): string {
    return this._data.ProjectNo;
  }

  get projectName(): string {
    return this._data.ProjectName;
  }

  get kst(): string {
    return this._data.KST;
  }

  get profession(): string {
    return this._data.Profession;
  }

  get customerName(): string {
    return this._data.CustomerName;
  }

  get workplace(): string {
    return this._data.Workplace;
  }

  get section(): string {
    return this._data.Section;
  }

  get region(): string {
    return this._data.Region;
  }

  get trip(): number {
    return this._data.Trip ? this._data.Trip : 0;
  }

  set trip(_trip: number) {
    this._data.Trip = _trip;
  }

  get accommodation(): number {
    return this._data.Accommodation ? this._data.Accommodation : 0;
  }

  set accommodation(_accommodation: number) {
    this._data.Accommodation = _accommodation;
  }

  isNew() {
    return this.status && this.status === BookingInvoiceFormStatus.New;
  }

  isNotEmpty() {
    return !this.isEmpty();
  }

  isEmpty() {
    return !this.billingsData.length;
  }

  cloneDataFromEntity(entity: BookingInvoiceFormEntity) {
    this.period = entity.period;
    this.order = entity.order;
    this.cvu = entity.cvu;
    this.clientName = entity.clientName;
    this.contractNumber = entity.contractNumber;
    this.timesheet = entity.timesheet;
    this.lowTB = entity.lowTB;
    this.note = entity.note;
    this.consolidatedInvoice = entity.consolidatedInvoice;
  }
}
