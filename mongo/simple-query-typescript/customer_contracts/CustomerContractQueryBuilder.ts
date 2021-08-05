import { isEmpty, trim } from "lodash";
import { FilterQuery } from "mongodb";
import moment from "moment";
import { ICustomerContractFilter } from "~/Shared/interface";
import { stringNormalize } from "~/common";
import { decodeProfAoeSpec } from "~/common/ConsultantSearch";

export class CustomerContractQueryBuilder {
  constructor(private filter: ICustomerContractFilter) {}

  build() {
    const query: FilterQuery<any> = {};

    const text = trim(this.filter.text);

    if (text) {
      query["search.searchField"] = new RegExp(stringNormalize(text), "i");
    }

    if (this.filter.contractStart) {
      query["lifecycle.startDate"] = toStartOfDayUtc(this.filter.contractStart);
    }

    if (this.filter.contractEnd) {
      query["lifecycle.endDate"] = toStartOfDayUtc(this.filter.contractEnd);
    }

    if (this.filter.contractPriceAdjustmentDate) {
      query["lifecycle.priceAdjustmentDate"] = toStartOfDayUtc(
        this.filter.contractPriceAdjustmentDate
      );
    }

    if (this.filter.contractProlongation) {
      query["lifecycle.prolongationDate"] = toStartOfDayUtc(
        this.filter.contractProlongation
      );
    }

    this.handleProfessions(query);

    return query;
  }

  private handleProfessions(query: FilterQuery<any>) {
    if (isEmpty(this.filter.professions)) {
      return;
    }

    query["search.expertise"] = { $all: this.filter.professions };
  }
}

function toStartOfDayUtc(d: Date) {
  return moment
    .utc(d)
    .startOf("day")
    .toDate();
}
