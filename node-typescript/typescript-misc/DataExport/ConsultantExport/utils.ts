import { ColumnMapper, StyleRecord, WorkBook } from "../WriteToExcel";
import locale from "~/locale";
import { Consultant } from "~/Domain/types";

export interface Row {
  consultant: Consultant;
}

export const columns: Array<ColumnMapper<Row>> = [
  {
    header: locale.Name,
    setCell: ({ cell, row }) => cell.string(row.consultant?.Name)
  },
  {
    header: locale.Mobile,
    setCell: ({ cell, row }) => cell.string(row.consultant?.CellPhone)
  },
  {
    header: locale.Email,
    setCell: ({ cell, row }) => cell.string(row.consultant?.Email)
  },
  {
    header: locale["Responsible BA"],
    setCell: ({ cell, row }) => cell.string(row.consultant?.ResponsiblePerson?.Name || "")
  },
  {
    header: locale.Country,
    setCell: ({ cell, row }) => cell.string(row.consultant?.Address?.Country || "")
  },
  {
    header: locale.City,
    setCell: ({ cell, row }) => cell.string(row.consultant?.Address?.City || "")
  },
  {
    header: locale.ZipCode,
    setCell: ({ cell, row }) => cell.string(row.consultant?.Address?.ZipCode || "")
  },
  {
    header: locale.StreetName,
    setCell: ({ cell, row }) => cell.string(row.consultant?.Address?.StreetName || "")
  }
];
