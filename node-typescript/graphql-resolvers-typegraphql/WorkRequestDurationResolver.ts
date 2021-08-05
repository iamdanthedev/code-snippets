import {
  Field,
  FieldResolver,
  Float,
  Int,
  ObjectType,
  registerEnumType,
  Resolver,
  Root
} from "type-graphql";
import * as Domain from "~/Domain/types";
import { DateScalar, ObjectIDScalar } from "~/Server/graphql/shared/scalars";

@ObjectType()
export class WorkRequestActualDuration {
  @Field(type => DateScalar)
  from: Date;

  @Field(type => DateScalar)
  to: Date;
}

@ObjectType()
export class WorkRequestDuration {}

@Resolver(of => WorkRequestDuration)
export class WorkRequestDurationResolver {
  @FieldResolver(type => ObjectIDScalar)
  _id(@Root() root: Domain.WorkRequestDuration) {
    return root._id;
  }

  @FieldResolver(type => Domain.DurationType)
  DurationType(@Root() root: Domain.WorkRequestDuration) {
    return root.durationType;
  }

  @FieldResolver(type => DateScalar)
  From(@Root() root: Domain.WorkRequestDuration) {
    return root.from;
  }

  @FieldResolver(type => DateScalar)
  To(@Root() root: Domain.WorkRequestDuration) {
    return root.to;
  }

  @FieldResolver(type => Float)
  BusyRatio(@Root() root: Domain.WorkRequestDuration) {
    return root.busyRatio;
  }

  @FieldResolver(type => String)
  Comment(@Root() root: Domain.WorkRequestDuration) {
    return root.comment;
  }

  @FieldResolver(type => Int)
  Vacancies(@Root() root: Domain.WorkRequestDuration) {
    return root.vacancies;
  }
}
