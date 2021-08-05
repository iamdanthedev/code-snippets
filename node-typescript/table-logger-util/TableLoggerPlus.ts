import fs from "fs";
import { resolve } from "path";
import json2csv from "json-2-csv";
import moment from "moment";
import { toPairs, fromPairs } from "lodash";
import debug from "debug";

export class TableLoggerPlus<T> {
  _rows: Array<Partial<T>> = [];
  _rowIds: Record<string, number> = {};

  _log = debug("TableLoggerPlus");

  constructor() {
    // debug.enable("TableLoggerPlus");
  }

  addRow(rowId: any, data: Partial<T>);
  addRow(data: Partial<T>);
  addRow(...args: any[]) {
    const rowId = args.length === 2 ? args[0].toString() : null;
    const data = args.length === 2 ? args[1] : args[0];

    const index = this._rows.push(data);

    if (rowId) {
      this._rowIds[rowId] = index;
    }

    this._log("%o", data);
  }

  sortRows(cb: (rows: Array<Partial<T>>) => Array<Partial<T>>) {
    this._rows = cb(this._rows);
  }

  toCSV() {
    const rowIds = fromPairs(toPairs(this._rowIds).map(x => [x[1], x[0]]));
    const rows = this._rows.map((x, i) => ({
      rowId: rowIds[i],
      ...x
    }));

    return json2csv.json2csvAsync(rows, { excelBOM: true, emptyFieldValue: "" });
  }

  async write(dirname: string, name = "result") {
    const timestamp = moment().format("YYYYMMDDHHmmss");
    const path = resolve(dirname, `${name}_${timestamp}.csv`);
    const csv = await this.toCSV();
    fs.writeFileSync(path, csv);
  }
}
