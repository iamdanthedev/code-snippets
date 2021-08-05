import {
  ContractArticleScheduleType,
  ContractArticleWeekDay,
  ContractArticleWorkType,
  ContractArticle
} from "../../ContractArticle";

export class BookingContractArticle {
  static CreateFromContractArticle(article: ContractArticle) {
    const item = new BookingContractArticle();

    item.priceUnit = article.PriceUnit;
    item.weekDayStart = article.WeekDayStart;
    item.weekDayEnd = article.WeekDayEnd;
    item.workType = article.WorkType;
    item.workScheduleType = article.WorkScheduleType;
    item.isDefault = article.IsDefault;
    item.priority = article.Priority;

    return item;
  }

  priceUnit: string;
  weekDayStart: ContractArticleWeekDay;
  weekDayEnd: ContractArticleWeekDay;
  workType: ContractArticleWorkType;
  workScheduleType: ContractArticleScheduleType;
  isDefault: boolean;
  priority: number; // the higher the more at the top of the list it is
}
