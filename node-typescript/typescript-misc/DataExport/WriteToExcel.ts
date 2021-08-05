import { Writable } from "stream";
import xl from "excel4node";
import { defaultWSOptions, defaultCellStyle } from "./defaultWBOptions";
import { WriteToExcelOptions } from "./WriteToExcelOptions";

export type WorkBook = any;
export type Cell = any;
export type Column = any;
export type Style = any;
export type StyleRecord = Record<string, Style>;

export type ColumnMapperSetCellOptions<T> = {
  cell: Cell;
  row: T;
  styles: StyleRecord;
};

export type SetColumnOptions = {
  column: Column;
  styles: StyleRecord;
};

export type ColumnMapper<T> = {
  dataKey?: string;
  header: string;
  setCell: (options: ColumnMapperSetCellOptions<T>) => void;
  setColumn?: (options: SetColumnOptions) => void;
};

/**
 * Implements a writable stream that accepts a stream
 * of objects of <T> and feeds it to Excel based on
 * column settings
 */
export class WriteToExcel<IncomingRow, Row = IncomingRow> extends Writable {
  wb: WorkBook;
  ws: any;
  styles: StyleRecord;
  rowNum = 1;
  contentRowNum = 0;

  private _lastGroup: string;
  private _rowGroupLevel = 0;

  constructor(
    private outFile: string,
    private options: WriteToExcelOptions<IncomingRow, Row>
  ) {
    super({ objectMode: true });

    this.wb = new xl.Workbook();
    this.ws = this.wb.addWorksheet("Export", defaultWSOptions);
    this.styles = options.makeStyles ? options.makeStyles(this.wb) : {};
    this.styles.defaultCellStyle = this.wb.createStyle(defaultCellStyle);

    this.setColumns();
    this.writeHeaders();
    this.rowNum++;
  }

  finish(cb) {
    this.ws.row(1).filter();
    this.wb.write(this.outFile, cb);
  }

  _write(data: IncomingRow, encoding: string, callback: () => void): void {
    if (!data) {
      return callback();
    }

    const row = this.options.transformRow(data);

    this.writeGroupHeader(row);
    this.writeRow(row);
    this.rowNum++;
    this.contentRowNum++;

    callback();
  }

  private setColumns() {
    const { columns } = this.options;

    columns.forEach((column, i) => {
      if (!column.setColumn) {
        return;
      }

      const col = this.ws.column(i + 1);
      column.setColumn({ column: col, styles: this.styles });
    });
  }

  private writeHeaders() {
    this.options.columns.forEach((col, i) => {
      this.ws.cell(this.rowNum, i + 1).string(col.header);
    });
  }

  private writeGroupHeader(row: Row) {
    const { columns, groupBy, getGroupRowStyle } = this.options;

    if (!groupBy) {
      return;
    }

    const currentGroup = groupBy(row, this.rowNum);

    if (currentGroup !== this._lastGroup) {
      const groupStyle = getGroupRowStyle
        ? getGroupRowStyle(currentGroup, this.styles)
        : null;

      this.ws
        // merge cells
        .cell(this.rowNum, 1, this.rowNum, columns.length, true)
        .string(currentGroup)
        .style(this.styles.defaultCellStyle);

      if (groupStyle) {
        this.ws.cell(this.rowNum, 1).style(groupStyle);
      }

      this.rowNum++;
      this._rowGroupLevel = 1;
    }

    if (this._rowGroupLevel > 0) {
      this.ws.row(this.rowNum).group(this._rowGroupLevel, false);
    }

    this._lastGroup = currentGroup;
  }

  private writeRow(row: Row) {
    const { columns, getRowStyle } = this.options;

    const rowStyle = getRowStyle ? getRowStyle(row, this.styles) : null;

    columns.forEach((col, i) => {
      const cell = this.ws.cell(this.rowNum, i + 1).style(this.styles.defaultCellStyle);

      if (rowStyle) {
        cell.style(rowStyle);
      }

      col.setCell({ cell, row, styles: this.styles });
    });
  }
}
