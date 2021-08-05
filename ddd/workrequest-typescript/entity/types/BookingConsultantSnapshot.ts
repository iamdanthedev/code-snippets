import { IsEnum, IsString } from "class-validator";
import { Consultant } from "../../Consultant";
import { LegalPersonType } from "../../misc";
import { Column, Entity } from "~/Domain/metadata";

@Entity()
export class BookingConsultantSnapshot {
  static FromConsultant(consultant: Consultant) {
    return new BookingConsultantSnapshot(
      consultant.LegalPersonType,
      consultant.BusinessName,
      consultant.BusinessSocialSecurityNo
    );
  }

  @Column()
  @IsEnum(LegalPersonType)
  legalPersonType: LegalPersonType;

  @Column()
  @IsString()
  businessName: string;

  @Column()
  @IsString()
  businessSocialSecurityNo: string;

  constructor(
    legalPersonType: LegalPersonType,
    businessName: string,
    businessSocialSecurityNo: string
  ) {
    this.legalPersonType = legalPersonType;
    this.businessName = businessName;
    this.businessSocialSecurityNo = businessSocialSecurityNo;
  }
}
