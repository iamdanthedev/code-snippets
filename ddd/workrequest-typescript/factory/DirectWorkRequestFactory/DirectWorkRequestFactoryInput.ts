import { ObjectID } from "bson";
import { transformAndValidateSync } from "class-transformer-validator";
import { BookingConsultantSnapshot, ContractType } from "~/Domain/types";
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested
} from "class-validator";

export interface IDirectWorkRequestFactoryInput {
  areaOfExpertise: string;
  consultantId: ObjectID;
  consultantSnapshot: BookingConsultantSnapshot | null;
  contractType: ContractType;
  costCenter: string;
  departmentIds: ObjectID[];
  hospitalId: ObjectID;
  projectId: ObjectID;
  specializations: string[];
  weeks: Date[];
  accommodationRequired: boolean;
  travelRequired: boolean;
}

export class DirectWorkRequestFactoryInput implements IDirectWorkRequestFactoryInput {
  static Create(input: IDirectWorkRequestFactoryInput) {
    return transformAndValidateSync(DirectWorkRequestFactoryInput, input);
  }

  @IsString()
  @IsNotEmpty()
  areaOfExpertise: string;

  consultantId: ObjectID;

  @ValidateNested()
  @IsOptional()
  consultantSnapshot: BookingConsultantSnapshot | null;

  @IsEnum(ContractType)
  contractType: ContractType;

  @IsString()
  @IsNotEmpty()
  costCenter: string;

  departmentIds: ObjectID[];

  hospitalId: ObjectID;

  projectId: ObjectID;

  @IsString({ each: true })
  specializations: string[];

  @IsDate({ each: true })
  weeks: Date[];

  @IsBoolean()
  accommodationRequired: boolean;

  @IsBoolean()
  travelRequired: boolean;
}
