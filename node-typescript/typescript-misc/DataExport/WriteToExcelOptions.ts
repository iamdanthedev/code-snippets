import {
  ColumnMapper,
  Style,
  StyleRecord,
  WorkBook
} from "~/AppService/DataExport/WriteToExcel";

export class WriteToExcelOptions<IncomingRow, Row = IncomingRow> {
  makeStyles: (wb: WorkBook) => StyleRecord;
  getRowStyle: (row: Row, styles: StyleRecord) => Style;
  getGroupRowStyle: (group: string, styles: StyleRecord) => Style;
  groupBy: (row: Row, rowIndex: number) => string;

  constructor(
    public transformRow: (row: IncomingRow) => Row,
    public columns: Array<ColumnMapper<Row>>
  ) {}
}
