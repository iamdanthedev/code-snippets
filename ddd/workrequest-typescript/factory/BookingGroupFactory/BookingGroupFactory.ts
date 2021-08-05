import { ObjectID } from "bson";
import { inject, injectable } from "inversify";
import { compact } from "lodash";
import moment from "moment";
import {
  Booking,
  BookingConsultantSnapshot,
  BookingGroup,
  LegalPersonType
} from "~/Domain/types";
import { ConsultantRef, NodeRef } from "~/Domain/ref";
import { ConsultantRepository, ProjectRepository } from "~/Domain/repository";
import { BookingGroupFactoryInput } from "./BookingGroupFactoryInput";
import { ConfigService } from "~/Domain/service";

@injectable()
export class BookingGroupFactory {
  constructor(
    @inject(ConsultantRepository) private consultantRepository: ConsultantRepository,
    @inject(ProjectRepository) private projectRepository: ProjectRepository,
    @inject(ConfigService) private configService: ConfigService
  ) {}

  async create(
    input: BookingGroupFactoryInput
  ): Promise<{ bookingGroup: BookingGroup; bookings: Booking[] }> {
    const bookingGroup = BookingGroup.Create();
    const bookings = await this.createBookings(bookingGroup._id, input);

    return { bookingGroup, bookings };
  }

  async createBookings(
    bookingGroupId: ObjectID,
    input: BookingGroupFactoryInput
  ): Promise<Booking[]> {
    const [consultant, project] = await Promise.all([
      this.consultantRepository.findById(input.consultantId),
      input.projectId ? this.projectRepository.findById(input.projectId) : null
    ]);

    const consultantRef = new ConsultantRef(consultant);
    const bookings: Booking[] = [];
    const weeks = compact(input.weeks);

    const consultantSnapshot =
      input.consultantSnapshot || BookingConsultantSnapshot.FromConsultant(consultant);

    const contractType =
      consultantSnapshot.legalPersonType === LegalPersonType.Employee
        ? input.contractType
        : null;

    const costCenter = this.configService.getCostCenter(input.costCenter);

    for (const week of weeks) {
      const weekStart = moment.utc(week).startOf("isoWeek");

      const booking = Booking.Create({
        areaOfExpertise: input.areaOfExpertise,
        bookingGroupId,
        contractType,
        costCenter,
        consultantSnapshot,
        consultantRef,
        createdBy: input.createdBy,
        customerNumber: input.customerNumber,
        projectRef: project ? NodeRef.FromProject(project) : null,
        week: weekStart.toDate(),
        accommodationRequired: input.accommodationRequired,
        travelRequired: input.travelRequired
      });

      booking.contractOptions = compact(input.contractOptions);

      bookings.push(booking);
    }

    return bookings;
  }
}
