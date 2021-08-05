import { AggregationCursor, FilterQuery, ObjectID } from "mongodb";
import { inject, injectable } from "inversify";
import moment from "moment";
import { isEmpty } from "lodash";
import { dump } from "~/common/dump";
import { stringNormalize, weekYearToDate } from "~/common";

import {
  TeamRepository,
  WorkRequestRepository,
  WorkRequestWeekRepository
} from "~/Domain/repository";
import {
  countryToSearch,
  orgTypeToSearch,
  regionToSearch
} from "~/Domain/repository/CustomerRepository";
import {
  Customer,
  OrganizationType,
  WorkRequest,
  WorkRequestStatus,
  WorkRequestWeek,
  WorkRequestTags
} from "~/Domain/types";
import { getOverlappingDurationMatch } from "./utils";
import { IUserContext, IUserContextType } from "~/Shared/interface";
import { StringSanitizer } from "~/Domain/utils/StringSanitizer";
import { WorkRequestPriorityType } from "~/Shared/Enums";
export { WorkRequestTags };

type Filters = Array<FilterQuery<any>>;

export enum WorkRequestStatusInput {
  Draft = "Draft",
  PublishedInCRM = "PublishedInCRM",
  PublishedInApp = "PublishedInApp",
  NotPublishedInApp = "NotPublishedInApp",
  Closed = "Closed"
}

export interface WorkRequestQueryOptions {
  includeOnlyIds?: ObjectID[];
  excludeIds?: ObjectID[];
  dontRestrictAreasOfExpertise?: boolean;
  from?: Date;
  to?: Date;
  /**
   * duration weeks
   */
  weeks?: Array<{ year: number; week: number }>;
  applicants?: ObjectID[];
  areaOfExpertise?: string[];
  bookedConsultants?: ObjectID[];
  regions?: Array<{ country: string; region: string }>;
  location?: string[];
  responsiblePersonId?: ObjectID[];
  specialization?: string[];
  status?: WorkRequestStatusInput[];
  text?: string;
  organizationType?: OrganizationType[];
  workRequestPriorityType?: WorkRequestPriorityType;
  workRequestTags?: WorkRequestTags[];
  customerGroup?: string[];
  workplaceId?: ObjectID[];
}

/**
 * Created a mongo query to filter workrequests or workrequest weeks
 */
@injectable()
export class WorkRequestsQuery {
  constructor(
    @inject(WorkRequestRepository) private workRequestRepository: WorkRequestRepository,
    @inject(WorkRequestWeekRepository)
    private workRequestWeekRepository: WorkRequestWeekRepository,
    @inject(TeamRepository) private teamRepository: TeamRepository,
    @inject(IUserContextType) private userCtx: IUserContext
  ) {}

  async filterWorkRequests(input: WorkRequestQueryOptions) {
    const query = await this.getWorkRequestQuery(input);
    dump(__dirname, "filterWorkRequests", input, query);
    return this.workRequestRepository.find(query);
  }

  async filterWorkRequestsWithCustomers(input: WorkRequestQueryOptions) {
    const query = await this.getWorkRequestQuery(input);
    dump(__dirname, "filterWorkRequestsWithCustomers", input, query);
    return this.workRequestRepository.find(query);
  }

  async filterWeeksWithCustomers(filter: WorkRequestQueryOptions) {
    const query = await this.getWorkRequestWeekQuery(filter);

    const aggregation = [
      {
        $match: query
      },
      {
        $sort: { Week: 1 }
      },
      {
        $lookup: {
          from: "workrequests",
          localField: "WorkRequestRef.NodeID",
          foreignField: "_id",
          as: "WorkRequest"
        }
      },
      {
        $unwind: "$WorkRequest"
      },
      {
        $lookup: {
          from: "customers",
          localField: "CustomerRef.Id",
          foreignField: "_id",
          as: "WorkRequest.Customer"
        }
      },
      {
        $unwind: "$WorkRequest.Customer"
      }
    ];

    dump(__dirname, "filterWeeksWithCustomers", filter, aggregation);

    return this.workRequestWeekRepository.collection.aggregate(
      aggregation
    ) as AggregationCursor<
      WorkRequestWeek & { WorkRequest: WorkRequest & { Customer: Customer } }
    >;
  }

  /**
   * Returns a query based on filter
   */
  private async getWorkRequestQuery(
    input: WorkRequestQueryOptions
  ): Promise<FilterQuery<WorkRequest>> {
    input = { ...input };
    input.text = StringSanitizer.SanitizeString(input.text);

    const filters: Filters = [];
    this.addDates(input, filters);
    this.addWeeks(input, filters);
    this.addCommon(input, filters);
    this.addStatus(input, filters, "search");
    this.addOrgTypes(input, filters);
    this.addWorkRequestTags(input, filters);
    this.addLocation(input, filters);
    this.excludeDirect(filters, "search");

    if (!input.dontRestrictAreasOfExpertise) {
      await this.addAllowedAreasOfExpertise("search.areaOfExpertise", filters);
    }

    return filters.length > 0 ? { $and: filters } : {};
  }

  private async getWorkRequestWeekQuery(
    input: WorkRequestQueryOptions
  ): Promise<FilterQuery<WorkRequestWeek>> {
    input = { ...input };
    input.text = StringSanitizer.SanitizeString(input.text);

    const filters: Filters = [];
    this.addWeekDate(input, filters);
    this.addCommon(input, filters);
    this.addStatus(input, filters, "workRequestSearch");
    this.addOrgTypes(input, filters);
    this.addWorkRequestTags(input, filters);
    this.excludeDirect(filters, "workRequestSearch");

    if (!input.dontRestrictAreasOfExpertise) {
      await this.addAllowedAreasOfExpertise("workRequestSearch.areaOfExpertise", filters);
    }

    return filters.length > 0 ? { $and: filters } : {};
  }

  private addCommon(input: WorkRequestQueryOptions, filters: Filters) {
    this.addIds(input, filters);
    this.excludeIds(input, filters);
    this.addWorkRequestPriorityType(input, filters);
    this.addAreaOfExpertise(input, filters);
    this.addRegions(input, filters);
    this.addResponsiblePerson(input, filters);
    this.addSpecialization(input, filters);
    this.addText(input, filters);
    this.addApplicants(input, filters);
    this.addBookedConsultants(input, filters);
    this.addCustomerType(input, filters);
    this.addWorkplaceId(input, filters);
  }

  private addIds(input: WorkRequestQueryOptions, filters: Filters) {
    if (isEmpty(input.includeOnlyIds)) {
      return;
    }

    filters.push({
      _id: { $in: input.includeOnlyIds }
    });
  }

  private excludeIds(input: WorkRequestQueryOptions, filters: Filters) {
    if (isEmpty(input.excludeIds)) {
      return;
    }

    filters.push({
      _id: { $nin: input.excludeIds }
    });
  }

  private addWorkplaceId(input: WorkRequestQueryOptions, filters: Filters) {
    if (isEmpty(input.workplaceId)) {
      return;
    }

    filters.push({
      "workplace.customerRef.Id": { $in: input.workplaceId }
    });
  }

  private addApplicants(input: WorkRequestQueryOptions, filters: Filters) {
    const { applicants } = input;

    if (isEmpty(applicants)) {
      return;
    }

    filters.push({
      applications: { $elemMatch: { "consultantRef.NodeID": { $in: applicants } } }
    });
  }

  private addWorkRequestTags = (input: WorkRequestQueryOptions, filters: Filters) => {
    if (isEmpty(input.workRequestTags)) {
      return;
    }

    filters.push({
      workRequestTags: { $in: input.workRequestTags }
    });
  };

  private addBookedConsultants(input: WorkRequestQueryOptions, filters: Filters) {
    const { bookedConsultants } = input;

    if (isEmpty(bookedConsultants)) {
      return;
    }

    filters.push({
      Bookings: {
        $elemMatch: { "ConsultantRef.NodeID": { $in: bookedConsultants } }
      }
    });
  }

  private addAreaOfExpertise(input: WorkRequestQueryOptions, filters: Filters) {
    const { areaOfExpertise } = input;

    if (isEmpty(areaOfExpertise)) {
      return;
    }

    filters.push({
      "search.searchArray": { $in: areaOfExpertise }
    });
  }

  private addDates(input: WorkRequestQueryOptions, filters: Filters) {
    if (!input.from) {
      return;
    }

    const match = getOverlappingDurationMatch(input);

    if (!match) {
      return;
    }

    filters.push(match);
    filters.push({
      // meaning durations.length > 0
      // see https://stackoverflow.com/questions/7811163/query-for-documents-where-array-size-is-greater-than-1
      "duration.0": { $exists: true }
    });
  }

  private addWeeks(input: WorkRequestQueryOptions, filters: Filters) {
    if (isEmpty(input.weeks)) {
      return;
    }

    const weekDates = input.weeks.map(x =>
      weekYearToDate({ Week: x.week, Year: x.year })
    );

    filters.push({
      "search.durationWeeks": { $in: weekDates }
    });
  }

  private addSpecialization(input: WorkRequestQueryOptions, filters: Filters) {
    const { specialization } = input;

    if (isEmpty(specialization)) {
      return;
    }

    filters.push({
      "search.searchArray": { $in: specialization }
    });
  }

  private addRegions(input: WorkRequestQueryOptions, filters: Filters) {
    const { regions } = input;

    if (isEmpty(regions)) {
      return;
    }

    const regionFilters: FilterQuery<any> = [];

    regions.forEach(({ country, region }) => {
      if (region === "*") {
        regionFilters.push({
          "customerSearch.SearchArray": {
            $all: [countryToSearch(country)]
          }
        });
      } else {
        regionFilters.push({
          "customerSearch.SearchArray": {
            $all: [countryToSearch(country), regionToSearch(region)]
          }
        });
      }
    });

    filters.push({
      $or: regionFilters
    });
  }

  private addLocation(input: WorkRequestQueryOptions, filters: Filters) {
    const { location } = input;

    if (isEmpty(location)) {
      return;
    }

    const m = {
      $or: location.map(x => ({
        $or: [
          { "search.address.City": x },
          { "search.address.County": x },
          { "search.address.Region": x }
        ]
      }))
    };

    filters.push(m);
  }

  private addResponsiblePerson(input: WorkRequestQueryOptions, filters: Filters) {
    const { responsiblePersonId } = input;

    if (isEmpty(responsiblePersonId)) {
      return;
    }

    filters.push({
      "customerSearch.ResponsiblePerson.PersonId": {
        $in: responsiblePersonId.map(r => new ObjectID(r))
      }
    });
  }

  private addText(input: WorkRequestQueryOptions, filters: Filters) {
    const { text } = input;

    if (typeof text !== "string" || !text) {
      return;
    }

    const norm = stringNormalize(text, { preserveSpaces: true });
    const re = new RegExp(norm.replace(/\s/g, ".*"), "i");

    const q = {
      $or: [
        {
          "customerSearch.SearchField": { $regex: re }
        },
        {
          "search.searchField": { $regex: re }
        }
      ]
    };

    filters.push(q);
  }

  private addStatus(input: WorkRequestQueryOptions, filters: Filters, fieldName: string) {
    const { status } = input;

    if (!Array.isArray(status) || status.length === 0) {
      return;
    }

    // remove options that exist in WRStatusInput and don't exist in WRStatus
    const statuses = ((input.status as any) as WorkRequestStatus[]).filter(x =>
      Object.values(WorkRequestStatus).includes(x)
    );

    if (input.status.includes(WorkRequestStatusInput.PublishedInCRM)) {
      statuses.push(WorkRequestStatus.Published);
    }

    if (input.status.includes(WorkRequestStatusInput.PublishedInApp)) {
      statuses.push(WorkRequestStatus.Published);
    }

    const _statuses = statuses.map(x => `Status: ${x}`);

    if (input.status.includes(WorkRequestStatusInput.PublishedInApp)) {
      return filters.push({ showInApp: true });
    }

    if (input.status.includes(WorkRequestStatusInput.NotPublishedInApp)) {
      return filters.push({ showInApp: false });
    }

    filters.push({
      [`${fieldName}.searchArray`]: { $in: _statuses }
    });
  }

  private addOrgTypes(input: WorkRequestQueryOptions, filters: Filters) {
    const { organizationType } = input;
    if (!Array.isArray(organizationType) || organizationType.length === 0) {
      return;
    }

    filters.push({
      "customerSearch.SearchArray": {
        $in: organizationType.map(orgTypeToSearch).compact()
      }
    });
  }

  private addWorkRequestPriorityType(input: WorkRequestQueryOptions, filters: Filters) {
    if (input.workRequestPriorityType == null) {
      return;
    }

    if (input.workRequestPriorityType === WorkRequestPriorityType.Yes) {
      filters.push({ isPriority: true });
    }

    if (input.workRequestPriorityType === WorkRequestPriorityType.No) {
      filters.push({ isPriority: false });
    }
  }

  private excludeDirect(filters: Filters, fieldName: string) {
    filters.push({
      [`${fieldName}.searchArray`]: { $ne: `IsDirect: true` }
    });
  }

  private addWeekDate(input: WorkRequestQueryOptions, filters: Filters) {
    if (!input.from || !input.to) {
      throw new Error("When filtering weeks both from and to must be set");
    }

    const from = moment(input.from)
      .startOf("isoWeek")
      .toDate();

    const to = moment(input.to)
      .endOf("isoWeek")
      .toDate();

    filters.push({
      Week: {
        $gte: from,
        $lte: to
      }
    });
  }

  private async addAllowedAreasOfExpertise(searchField: string, filters: Filters) {
    const allowedAreasOfExpertise = await this.teamRepository.getAreasOfExpertiseOnTeams(
      this.userCtx.teams
    );

    filters.push({
      $or: [{ [searchField]: "" }, { [searchField]: { $in: allowedAreasOfExpertise } }]
    });
  }

  private addCustomerType(input: WorkRequestQueryOptions, filters: Filters) {
    if (isEmpty(input.customerGroup)) {
      return;
    }

    const $in = input.customerGroup
      .map(x => (x === "" ? "null" : x))
      .map(customerGroup => `CustomerGroups: ${customerGroup}`);

    filters.push({
      "customerSearch.SearchArray": { $in }
    });
  }
}
