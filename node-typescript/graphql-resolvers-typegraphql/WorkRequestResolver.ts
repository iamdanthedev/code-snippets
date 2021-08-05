import { Ctx, FieldResolver, Float, Int, ObjectType, Resolver, Root } from "type-graphql";
import { compact, defaultTo } from "lodash";
import moment from "moment";
import { WorkRequestServiceNew } from "~/Domain/service";
import { URLResolver } from "~/Service";
import * as Domain from "~/Domain/types";
import { CustomerRepository } from "~/Domain/repository";
import { VacanciesByWeeksFactory } from "~/Domain/service/WorkRequestServiceNew/factory/VacanciesByWeeksFactory";
import { DateScalar, ObjectIDScalar } from "~/Server/graphql/shared/scalars";
import { BookingResolverParent } from "~/Server/graphql/internal/Booking/Booking";
import { fileToUri } from "~/Server/graphql/internal/SharedFile/fileToUri";
import { CustomerRef } from "~/Server/graphql/internal/Customer/CustomerRef";
import { WorkRequestPoolItem } from "~/Server/graphql/internal/WorkRequestPool/Types/WorkRequestPoolItem";
import {
  Address,
  Audit,
  Customer,
  Document,
  UserRef
} from "~/Server/graphql/TypeGraphQL/DummyResult";
import { WorkRequestDurationType } from "~/Shared/Enums";
import {
  WorkRequestActualDuration,
  WorkRequestDuration
} from "./WorkRequestDurationResolver";
import { WorkRequestWeekParam } from "./WorkRequestWeekParamResolver";
import { CustomerContract } from "../../CustomerContract/ResolverTypes/CustomerContractResolver";
import { Booking } from "../../Booking/types/Booking";
import { GqlContext } from "../../GqlContext";

@ObjectType()
export class WorkRequest {}

@Resolver(() => WorkRequest)
export class WorkRequestResolver {
  @FieldResolver(() => ObjectIDScalar)
  _id(@Root() root: Domain.WorkRequest) {
    return root._id;
  }

  // TODO: change return () to new Entity
  @FieldResolver(() => Audit)
  Audit(@Root() root: Domain.WorkRequest) {
    return root.audit;
  }

  @FieldResolver(() => String)
  WorkRequestNumber(@Root() root: Domain.WorkRequest) {
    return root.workRequestNumber || "";
  }

  @FieldResolver(() => String, { nullable: true })
  Description(@Root() root: Domain.WorkRequest) {
    return root.description;
  }

  @FieldResolver(() => String, { nullable: true })
  Schedule(@Root() root: Domain.WorkRequest) {
    return root.schedule;
  }

  @FieldResolver(() => String, { nullable: true })
  Qualifications(@Root() root: Domain.WorkRequest) {
    return root.qualifications;
  }

  @FieldResolver(() => Float, { nullable: true })
  HourlyRate(@Root() root: Domain.WorkRequest) {
    return 0.0;
  }

  @FieldResolver(() => UserRef, { nullable: true })
  ResponsiblePerson(@Root() root: Domain.WorkRequest) {
    return null;
  }

  @FieldResolver(() => [String])
  Applications(@Root() root: Domain.WorkRequest) {
    return [];
  }

  @FieldResolver(() => [Booking], { nullable: "itemsAndList" })
  async Bookings(@Ctx() ctx: GqlContext, @Root() root: Domain.WorkRequest) {
    if (!Array.isArray(root.bookings)) {
      return [];
    }

    const workRequestAggregate = await ctx.container
      .get(WorkRequestServiceNew)
      .createFromWorkRequest(root);

    return root.bookings.map(booking => {
      return new BookingResolverParent(booking._id, workRequestAggregate);
    });
  }

  @FieldResolver(() => [WorkRequestPoolItem])
  ConsultantPool(@Root() root: Domain.WorkRequest) {
    return root.consultantPool;
  }

  @FieldResolver(() => String, { nullable: true })
  AreaOfExpertise(@Root() root: Domain.WorkRequest) {
    return root.areaOfExpertise;
  }

  @FieldResolver(() => [CustomerContract])
  CustomerContracts(@Root() root: Domain.WorkRequest) {
    return [];
  }

  @FieldResolver(() => [String])
  CustomerNumber(@Root() root: Domain.WorkRequest) {
    return root.bookings
      .map(x => x.customerNumber)
      .compact()
      .unique();
  }

  @FieldResolver(() => [CustomerRef])
  DepartmentsRefs(@Root() root: Domain.WorkRequest) {
    return compact(root.workplace?.departmentRefs || []);
  }

  @FieldResolver(() => CustomerRef, { nullable: true })
  HospitalRef(@Root() root: Domain.WorkRequest) {
    return root.workplace?.customerRef;
  }

  @FieldResolver(() => [Document])
  Documents(@Root() root: Domain.WorkRequest) {
    // TODO: Write Document Resolver
    return root.documents;
  }

  @FieldResolver(() => [WorkRequestDuration])
  Duration(@Root() root: Domain.WorkRequest) {
    return root.duration;
  }

  @FieldResolver(() => WorkRequestDurationType)
  WorkRequestDurationType(@Root() root: Domain.WorkRequest) {
    return root.durationType ?? Domain.WorkRequestDurationType.Exact;
  }

  @FieldResolver(() => String, { nullable: true })
  DurationCustomText(@Root() root: Domain.WorkRequest) {
    return root.durationCustomText;
  }

  @FieldResolver(() => [WorkRequestActualDuration])
  ActualDuration(@Root() root: Domain.WorkRequest) {
    return VacanciesByWeeksFactory.VacanciesAsDurations(root.vacanciesByWeeks);
  }

  @FieldResolver(() => Boolean)
  ShowInApp(@Root() root: Domain.WorkRequest) {
    return root.showInApp;
  }

  @FieldResolver(() => [String])
  Specializations(@Root() root: Domain.WorkRequest) {
    return root.specializations;
  }

  @FieldResolver(() => Customer, { nullable: true })
  async Hospital(@Ctx() ctx: GqlContext, @Root() root: Domain.WorkRequest) {
    if (root.workplace) {
      const customerRepository = ctx.container.get(CustomerRepository);
      return await customerRepository.findById(root.workplace.customerRef.Id);
    }

    return null;
  }

  @FieldResolver(() => Boolean)
  EmailBased(@Root() root: Domain.WorkRequest) {
    return WorkRequestResolver.isEmailBased(root);
  }

  @FieldResolver(() => String, { nullable: true })
  EmailBasisFilePreviewURL(@Root() root: Domain.WorkRequest) {
    if (!WorkRequestResolver.isEmailBased(root)) {
      return "";
    }

    const bodyAtt = root.basis.attachments?.find(x => x.Name === "body");
    return bodyAtt ? fileToUri(bodyAtt.NodeID) : "";
  }

  @FieldResolver(() => DateScalar, { nullable: true })
  LastApplicationDate(@Root() root: Domain.WorkRequest) {
    return root.lastApplicationDate === "ASAP" ? null : root.lastApplicationDate;
  }

  @FieldResolver(() => Boolean)
  IsAsap(@Root() root: Domain.WorkRequest) {
    return Boolean(root.lastApplicationDate === "ASAP");
  }

  @FieldResolver(() => String, { nullable: true })
  EmailBasisFileURL(@Ctx() ctx: GqlContext, @Root() root: Domain.WorkRequest) {
    const urlResolver = ctx.container.get(URLResolver);
    if (!WorkRequestResolver.isEmailBased(root)) {
      return "";
    }

    const bodyAtt = root.basis.bodyFileRef;
    return bodyAtt ? urlResolver.docPdfUrl(bodyAtt.NodeID) : "";
  }

  @FieldResolver(() => String, { nullable: true })
  EmailBasisFrom(@Root() root: Domain.WorkRequest) {
    return WorkRequestResolver.isEmailBased(root) && defaultTo(root.basis.from, "");
  }
  @FieldResolver(() => String, { nullable: true })
  EmailBasisSubject(@Root() root: Domain.WorkRequest) {
    return WorkRequestResolver.isEmailBased(root) && defaultTo(root.basis.subject, "");
  }

  @FieldResolver(() => String, { nullable: true })
  EmailBasisTextPreview(@Root() root: Domain.WorkRequest) {
    return (
      WorkRequestResolver.isEmailBased(root) &&
      this.stripLongerThan(200)(defaultTo(root.basis.body, ""))
    );
  }

  @FieldResolver(() => String, { nullable: true })
  EmailBasisContactPersonName(@Root() root: Domain.WorkRequest) {
    return WorkRequestResolver.isEmailBased(root)
      ? root.basis?.contactPerson?.name ?? ""
      : "";
  }

  @FieldResolver(() => String, { nullable: true })
  EmailBasisContactPersonEmail(@Root() root: Domain.WorkRequest) {
    return WorkRequestResolver.isEmailBased(root)
      ? root.basis?.contactPerson?.email ?? ""
      : "";
  }

  @FieldResolver(() => String, { nullable: true })
  BasisSourceExpertise(@Root() root: Domain.WorkRequest) {
    return WorkRequestResolver.isEmailBased(root)
      ? root.basis?.source?.areaOfExpertise ?? ""
      : "";
  }

  @FieldResolver(() => String, { nullable: true })
  BasisSourceWorkplace(@Root() root: Domain.WorkRequest) {
    if (!WorkRequestResolver.isEmailBased(root)) {
      return "";
    }

    const customer = root.basis?.source?.workplace ?? "";
    const workplace = root.basis?.source?.department ?? "";

    if (!customer && !workplace) {
      return "";
    }

    return `${customer}/${workplace}`;
  }

  @FieldResolver(() => Boolean)
  IsDraft(@Root() root: Domain.WorkRequest) {
    return root.status === Domain.WorkRequestStatus.Draft;
  }

  @FieldResolver(() => Boolean)
  IsPublished(@Root() root: Domain.WorkRequest) {
    return root.status === Domain.WorkRequestStatus.Published;
  }
  @FieldResolver(() => Boolean)
  IsClosed(@Root() root: Domain.WorkRequest) {
    return root.status === Domain.WorkRequestStatus.Closed;
  }

  @FieldResolver(() => Domain.WorkRequestStatus)
  Status(@Root() root: Domain.WorkRequest) {
    return root.status || Domain.WorkRequestStatus.Draft;
  }

  @FieldResolver(() => DateScalar, { nullable: true })
  ReceivedOn(@Root() root: Domain.WorkRequest) {
    return root.receivedOn;
  }

  @FieldResolver(() => DateScalar, { nullable: true })
  PublishedOn(@Root() root: Domain.WorkRequest) {
    return root.publishedOn;
  }

  @FieldResolver(() => Int, { nullable: true })
  ReactionTimeMinutes(@Root() root: Domain.WorkRequest) {
    if (!root.publishedOn) {
      return null;
    }

    return moment(root.publishedOn).diff(root.receivedOn, "minutes");
  }

  @FieldResolver(() => Boolean)
  IsDirect(@Root() root: Domain.WorkRequest) {
    return Boolean(root.isDirect);
  }

  @FieldResolver(() => [WorkRequestWeekParam])
  WorkRequestWeeksParams(@Root() root: Domain.WorkRequest): WorkRequestWeekParam[] {
    return compact(root.vacanciesByWeeks).map(x => ({
      week: x.week,
      year: x.year,
      isDisabled: x.isDisabled,
      openVacancies: x.isDisabled ? 0 : x.openVacancies
    }));
  }

  @FieldResolver(() => Boolean)
  Deleted(@Root() root: Domain.WorkRequest) {
    return root.deleted;
  }

  @FieldResolver(() => Address, { nullable: true })
  async Address(@Ctx() ctx: GqlContext, @Root() root: Domain.WorkRequest) {
    return root.search.address;
  }

  @FieldResolver(() => Boolean)
  IsPriority(@Root() root: Domain.WorkRequest) {
    return Boolean(root.isPriority);
  }

  @FieldResolver(() => [Domain.WorkRequestTags])
  WorkRequestTags(@Root() root: Domain.WorkRequest) {
    return root.workRequestTags || [];
  }

  private stripLongerThan = (len: number) => (str: string) => {
    return str.length < len ? str : `${str.slice(0, len)}...`;
  };

  private static isEmailBased(wr: Domain.WorkRequest) {
    return Boolean(wr.basis && wr.basis.type === Domain.WorkRequestBasisType.Email);
  }
}
