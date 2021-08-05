import { ObjectID } from "bson";
import { ConsultantContractOptionRef, CustomerContractOptionRef } from "~/Domain/ref";
import { BookingContractArticle } from "./BookingContractArticle";
import { ContractArticleRef } from "../../ContractArticle";
import { ContractOptionType } from "../../ConsultantContractOption";

export class BookingContractOption {
  // static CreateFromCustomerContractOption(
  //   contractOption: CustomerContractOption,
  //   contractArticle: ContractArticle
  // ) {
  //   const item = new BookingContractOption();
  //
  //   item.contractOptionRef = CustomerContractOptionRef.Create(contractOption);
  //   item.contractArticleRef = contractOption.ContractArticleRef || null;
  //   item.contractArticle = BookingContractArticle.CreateFromContractArticle(
  //     contractArticle
  //   );
  //   item.areaOfExpertise = contractOption.AreaOfExpertise;
  //   item.specializations = contractOption.Specializations;
  //   item.description = "";
  //   item.consultantWorkTimeStart = contractOption.WorkTimeStart;
  //   item.consultantWorkTimeEnd = contractOption.WorkTimeEnd;
  //   item.customerWorkTimeStart = contractOption.WorkTimeStart;
  //   item.customerWorkTimeEnd = contractOption.WorkTimeEnd;
  //   item.type = ContractOptionType.Hourly;
  //   item.customerPrice = contractOption.Price;
  //   item.consultantPrice = 0;
  //
  //   return item;
  // }
  //
  // static CreateFromConsultantContractOption(
  //   contractOption: ConsultantContractOption,
  //   contractArticle: ContractArticle | null
  // ) {
  //   const item = new BookingContractOption();
  //
  //   item.areaOfExpertise = !isEmpty(contractOption.AreasOfExpertise)
  //     ? contractOption.AreasOfExpertise.join(", ")
  //     : "";
  //   item.contractOptionRef = ConsultantContractOptionRef.FromConsultantContractOption(
  //     contractOption
  //   );
  //   item.contractArticleRef = contractOption.ContractArticleRef || null;
  //   item.contractArticle = contractArticle
  //     ? BookingContractArticle.CreateFromContractArticle(contractArticle)
  //     : null;
  //   item.description = contractOption.Description;
  //   item.customerPrice = 0;
  //   item.consultantPrice = 0;
  //   item.type = contractOption.Type;
  //
  //   return item;
  // }
  //
  // static AdHoc(contractArticle: ContractArticle | null) {
  //   const item = new BookingContractOption();
  //
  //   item.areaOfExpertise = "";
  //   item.contractOptionRef = null;
  //   item.contractArticleRef = contractArticle
  //     ? ContractArticleRef.FromContractArticle(contractArticle)
  //     : null;
  //   item.contractArticle = contractArticle
  //     ? BookingContractArticle.CreateFromContractArticle(contractArticle)
  //     : null;
  //   item.description = "";
  //   item.customerPrice = 0;
  //   item.consultantPrice = 0;
  //   item.type = ContractOptionType.Hourly;
  //
  //   return item;
  // }

  _id = new ObjectID();
  contractOptionRef: ConsultantContractOptionRef | CustomerContractOptionRef | null;
  contractArticleRef: ContractArticleRef | null;
  contractArticle: BookingContractArticle | null;
  areaOfExpertise?: string; // customer contract options only
  specializations?: string[]; // customer contract options only
  description?: string;
  customerPrice: number;
  consultantPrice: number;
  type: ContractOptionType;
  customerWorkTimeStart?: string;
  customerWorkTimeEnd?: string;
  consultantWorkTimeStart?: string;
  consultantWorkTimeEnd?: string;
}
