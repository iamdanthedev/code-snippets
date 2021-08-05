import fs from "fs";
import { resolve } from "path";
import moment from "moment";
import json2csv from "json-2-csv";

export class TableLogger<T> {
  _items = new Map<string, Partial<T>>();

  setItem(key: any, data: Partial<T>) {
    key = key.toString();

    if (this._items.has(key)) {
      const val = this._items.get(key);
      this._items.set(key, { ...val, ...data });
    } else {
      this._items.set(key, data);
    }
  }

  push(key: string, logKey: keyof T, v: any) {
    const item = this._items.get(key);
    const newVal = [
      ...(item && item[logKey] ? ((item[logKey] as unknown) as any[]) : []),
      ...(Array.isArray(v) ? v : [v])
    ];
    this.setItem(key, { [logKey]: newVal } as any);
  }

  toCSV(process: (row: T) => any) {
    const keys = this._items.keys();

    const rows = [];

    for (const key of keys) {
      rows.push({
        _id: key,
        ...process(this._items.get(key) as any)
      });
    }

    return json2csv.json2csvAsync(rows, { excelBOM: true, emptyFieldValue: "" });
  }

  async write(dirname: string, name = "result", process: (row: T) => any = x => x) {
    const timestamp = moment().format("YYYYMMDDHHmmss");
    const path = resolve(dirname, `${name}_${timestamp}.csv`);
    const csv = await this.toCSV(process);
    fs.writeFileSync(path, csv);
  }
}
