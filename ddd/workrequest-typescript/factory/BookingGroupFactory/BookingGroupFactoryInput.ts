import {
  ArrayMinSize,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInstance,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested
} from "class-validator";
import { transformAndValidateSync } from "class-transformer-validator";
import { ObjectID } from "bson";
import {
  BookingConsultantSnapshot,
  BookingContractOption,
  ContractType,
  UserRef
} from "~/Domain/types";

export interface IBookingGroupFactoryInput {
  areaOfExpertise: string;
  consultantId: ObjectID;
  consultantSnapshot: BookingConsultantSnapshot | null;
  contractOptions: BookingContractOption[];
  contractType: ContractType;
  costCenter: string;
  createdBy: UserRef;
  customerNumber: string;
  projectId: ObjectID;
  weeks: Date[];
  accommodationRequired: boolean;
  travelRequired: boolean;
}

export class BookingGroupFactoryInput implements IBookingGroupFactoryInput {
  static Create(input: IBookingGroupFactoryInput) {
    return transformAndValidateSync(BookingGroupFactoryInput, input);
  }

  @IsString()
  @IsNotEmpty()
  areaOfExpertise: string;

  @IsNotEmpty()
  // @Transform(x => x)
  consultantId: ObjectID;

  @ValidateNested()
  @IsOptional()
  consultantSnapshot: BookingConsultantSnapshot | null;

  @ValidateNested({ each: true })
  contractOptions: BookingContractOption[];

  @IsEnum(ContractType)
  @IsOptional()
  contractType: ContractType;

  @IsString()
  @IsNotEmpty()
  costCenter: string;

  @IsString()
  @IsNotEmpty()
  customerNumber: string;

  @ValidateNested()
  @IsNotEmpty()
  createdBy: UserRef;

  @IsInstance(ObjectID)
  // @Transform(x => x)
  projectId: ObjectID;

  @IsDate({ each: true })
  @ArrayMinSize(1)
  weeks: Date[];

  @IsBoolean()
  accommodationRequired: boolean;

  @IsBoolean()
  travelRequired: boolean;
}
