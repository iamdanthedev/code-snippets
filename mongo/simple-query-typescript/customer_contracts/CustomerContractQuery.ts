import { inject, injectable } from "inversify";
import { CustomerContract } from "~/Domain/types";
import { CustomerContractRepository } from "~/Domain/repository";
import { ICustomerContractFilter } from "~/Shared/interface";
import { dump } from "~/common/dump";
import { CustomerContractQueryBuilder } from "./CustomerContractQueryBuilder";

@injectable()
export class CustomerContractQuery {
  constructor(
    @inject(CustomerContractRepository)
    private customerContractRepository: CustomerContractRepository
  ) {}

  async query(
    filter: ICustomerContractFilter,
    sort: any,
    skip: number,
    limit: number
  ): Promise<CustomerContract[]> {
    const query = new CustomerContractQueryBuilder(filter).build();

    dump(__dirname, filter, query);

    const items = await this.customerContractRepository
      .find(query, skip, sort, limit)
      .toArray();

    return items;
  }

  async total() {
    return this.customerContractRepository.count();
  }
}
