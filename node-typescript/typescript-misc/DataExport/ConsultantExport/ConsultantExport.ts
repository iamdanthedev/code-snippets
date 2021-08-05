import { inject, injectable } from "inversify";
import { ObjectID } from "bson";
import moment from "moment";
import path from "path";
import { tmpdir } from "os";
import { createWriteStream } from "fs";
import { ConsultantServiceNew } from "~/Domain/service";
import { ConsultantService } from "~/AppService";
import { ConsultantRepository } from "~/Domain/repository";
import debug from "debug";
import { BookingWeek, Consultant } from "~/Domain/types";
import { Row, columns } from "./utils";
import { WriteToExcelOptions } from "~/AppService/DataExport/WriteToExcelOptions";
import { WriteToExcel } from "~/AppService/DataExport/WriteToExcel";

@injectable()
export class ConsultantExport {
  private log = debug("app:ConsultantExport");
  constructor(
    @inject(ConsultantServiceNew) private consultantServiceNew: ConsultantServiceNew,
    @inject(ConsultantRepository) private consultantRepository: ConsultantRepository
  ) {}

  getOutFilename = () => {
    return `consultant_${moment().format("YYYYMMDDHHmmss")}.xlsx`;
  };

  getOutPath = (filename: string) => {
    return path.resolve(tmpdir(), filename);
  };

  createOutStream = (fileName: string) => {
    return createWriteStream(fileName, { encoding: "utf8" });
  };

  async export(ids: ObjectID[]) {
    return new Promise<string>((resolve, reject) => {
      const filename = this.getOutFilename();
      const out = this.getOutPath(filename);
      function transformRow(consultant: Consultant): Row {
        return {
          consultant
        };
      }

      const options = new WriteToExcelOptions(transformRow, columns);
      const writeToExcel = new WriteToExcel(out, options);

      this.log("writing to tmp file %s", out);

      const source = this.consultantRepository.findByIds(ids);
      const pipe = source.pipe(writeToExcel);

      source.on("close", () => {
        writeToExcel.finish(() => {
          resolve(filename);
        });
        pipe.destroy();
      });

      writeToExcel.on("error", err => {
        reject(err);
      });

      source.on("error", err => {
        reject(err);
      });

      pipe.on("error", err => {
        reject(err);
      });
    });
  }
}
