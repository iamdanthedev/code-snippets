import { inject, injectable } from "inversify";
import { createWriteStream } from "fs";
import path from "path";
import moment from "moment";
import { tmpdir } from "os";
import debug from "debug";
import { BookingWeekQuery, BookingWeekQueryInput } from "~/Domain/queries";
import { ProjectRepository } from "~/Domain/repository";
import { BookingWeek } from "~/Domain/types";
import { IUserContext, IUserContextType } from "~/Shared/interface";
import { getColumns, getRowStyle, getGroupRowStyle, makeStyles, Row } from "./utils";
import { WriteToExcel } from "../WriteToExcel";
import { WriteToExcelOptions } from "../WriteToExcelOptions";

@injectable()
export class BookingFinanceExport {
  private log = debug("app:BookingFinanceExport");

  constructor(
    @inject(BookingWeekQuery) private bookingWeekQuery: BookingWeekQuery,
    @inject(ProjectRepository) private projectRepository: ProjectRepository,
    @inject(IUserContextType) private userCtx: IUserContext
  ) {}

  /**
   * @returns resolves with a full filename
   */
  async export(input: BookingWeekQueryInput) {
    const projects = await this.getProjects(input);

    return new Promise<string>((resolve, reject) => {
      const filename = this.getOutFilename();
      const out = this.getOutPath(filename);

      function transformRow(bookingWeek: BookingWeek): Row {
        const project = bookingWeek.projectRef
          ? projects.find(x => x._id.equals(bookingWeek.projectRef.NodeID))
          : null;

        return {
          bookingWeek,
          project
        };
      }

      const withProfit = this.userCtx.permissions.includes("workrequest:read-profit");
      const columns = getColumns(withProfit);

      const options = new WriteToExcelOptions(transformRow, columns);
      options.makeStyles = makeStyles;
      options.getRowStyle = getRowStyle;
      options.getGroupRowStyle = getGroupRowStyle;
      options.groupBy = row => moment.utc(row.bookingWeek.week).format("WW-GGGG");

      const writeToExcel = new WriteToExcel(out, options);

      this.log("writing to tmp file %s", out);

      const source = this.bookingWeekQuery.getCursor(input);
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

  private async getProjects(input: BookingWeekQueryInput) {
    const cursor = await this.bookingWeekQuery.getCursor(input);
    const items = await cursor.project({ "projectRef.NodeID": 1 }).toArray();

    const projectIds = await items.map(x => x.projectRef?.NodeID).compact();
    const projects = await this.projectRepository.findByIds(projectIds).toArray();

    return projects;
  }

  private getOutFilename() {
    return `booking_finance_export_${moment().format("YYYYMMDDHHmmss")}.xlsx`;
  }

  private getOutPath(filename: string) {
    return path.resolve(tmpdir(), filename);
  }

  private createOutStream(fileName: string) {
    return createWriteStream(fileName, { encoding: "utf8" });
  }
}
