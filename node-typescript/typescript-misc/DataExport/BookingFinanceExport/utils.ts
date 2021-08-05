import moment from "moment";
import { isNumber, round } from "lodash";
import locale from "~/locale";
import {
  BookingWeek,
  EmployeeBookingCosts,
  Project,
  SubcontractorBookingCosts,
  TimeReportStatus
} from "~/Domain/types";
import { ColumnMapper, StyleRecord, WorkBook } from "../WriteToExcel";

export interface Row {
  bookingWeek: BookingWeek;
  project: Project;
}

export const makeStyles = (wb: WorkBook) => ({
  financeOK: wb.createStyle({
    fill: {
      type: "pattern",
      patternType: "solid",
      fgColor: "#d5e6c8"
    }
  }),

  inWork: wb.createStyle({
    fill: {
      type: "pattern",
      patternType: "solid",
      fgColor: "#f9f0da"
    }
  }),

  booleanField: {
    alignment: {
      horizontal: "center"
    }
  },

  sekField: {
    alignment: {
      horizontal: "right"
    },
    numberFormat: "#,##0.00 [$kr-41D];-#,##0.00 [$kr-41D]"
  },

  group: wb.createStyle({
    alignment: {
      horizontal: "center"
    },
    fill: {
      type: "pattern",
      patternType: "solid",
      fgColor: "#ff857a"
    },
    font: {
      color: "#ffffff",
      bold: true
    }
  })
});

export const getGroupRowStyle = (group: string, style: StyleRecord) => style.group;

export const getRowStyle = (row: Row, style: StyleRecord) => {
  if (row.bookingWeek.isConsultantPayed && row.bookingWeek.isCustomerBilled) {
    return style.financeOK;
  }

  if (row.bookingWeek.isConsultantPayed || row.bookingWeek.isCustomerBilled) {
    return style.inWork;
  }

  return null;
};

export function getColumns(withProfit: boolean): Array<ColumnMapper<Row>> {
  const columns: Array<ColumnMapper<Row>> = [
    {
      header: locale.Week,
      setCell: ({ cell, row }) =>
        cell.string(moment.utc(row.bookingWeek.week).format("WW-GGGG"))
    },
    {
      header: locale.Consultant,
      setColumn: ({ column }) => column.setWidth(32),
      setCell: ({ cell, row }) => cell.string(row.bookingWeek.consultantRef?.Name)
    },
    {
      header: locale["Responsible BA"],
      setColumn: ({ column }) => column.setWidth(64),
      setCell: ({ cell, row }) =>
        cell.string(row.bookingWeek.consultantSearch?.ResponsiblePerson?.Name || "")
    },
    {
      header: "Granskad av",
      setColumn: ({ column }) => column.setWidth(64),
      setCell: ({ cell, row }) =>
        cell.string(row.bookingWeek.bookingAudit?.setBy?.Name || "")
    },
    {
      header: locale.SocialSecurityNo,
      setColumn: ({ column }) => column.setWidth(32),
      setCell: ({ cell, row }) =>
        cell.string(row.bookingWeek.consultantSearch.SocialSecurityNo || "")
    },
    {
      header: locale["Employment type"],
      setColumn: ({ column }) => column.setWidth(64),
      setCell: ({ cell, row }) => {
        if (!row.bookingWeek.consultantSnapshot?.legalPersonType) {
          return cell.string("");
        }

        const value =
          locale.legalPersonType[row.bookingWeek.consultantSnapshot?.legalPersonType];
        cell.string(value);
      }
    },
    {
      header: "Org-kund",
      setColumn: ({ column }) => column.setWidth(32),
      setCell: ({ cell, row }) => cell.string(row.bookingWeek?.organizationRef?.Name)
    },
    {
      header: "Verksamhet",
      setColumn: ({ column }) => column.setWidth(32),
      setCell: ({ cell, row }) => cell.string(row.bookingWeek.hospitalRef?.Name)
    },
    {
      header: locale.AreaOfExpertise,
      setColumn: ({ column }) => column.setWidth(37),
      setCell: ({ cell, row }) => cell.string(row.bookingWeek.areaOfExpertise || "")
    },
    {
      header: locale.CostCenter,
      setColumn: ({ column }) => column.setWidth(32),
      setCell: ({ cell, row }) =>
        cell.string(
          row.bookingWeek.costCenter
            ? (row.bookingWeek.costCenter.id + row.bookingWeek.costCenter.name).trim()
            : ""
        )
    },
    {
      header: locale.Project,
      setCell: ({ cell, row }) => cell.string(row.project ? row.project.Name : "")
    },
    {
      header: locale.Alt,
      setColumn: ({ column }) => column.setWidth(23),
      setCell: ({ cell, row }) =>
        cell.string(
          row.bookingWeek.contractType
            ? locale.contractType[row.bookingWeek.contractType]
            : ""
        )
    },
    {
      header: locale.InvoiceNumberFull,
      setColumn: ({ column }) => column.setWidth(16),
      setCell: ({ cell, row }) =>
        cell.string((row.bookingWeek.customerInvoicing.invoiceNumbers || []).join(", "))
    },
    {
      header: locale.CustomerNumber,
      setColumn: ({ column }) => column.setWidth(16),
      setCell: ({ cell, row }) => cell.string(row.bookingWeek.customerNumber || "")
    },
    {
      header: locale.Billed,
      setCell: ({ cell, row, styles }) =>
        cell.style(styles.booleanField).string(yesNo(row.bookingWeek.isCustomerBilled))
    },
    {
      header: locale.Paid,
      setCell: ({ cell, row, styles }) =>
        cell.style(styles.booleanField).string(yesNo(row.bookingWeek.isConsultantPayed))
    },
    {
      header: locale.TimeReported,
      setCell: ({ cell, row, styles }) =>
        cell
          .style(styles.booleanField)
          .string(
            yesNo(
              row.bookingWeek.timeReportStatus === TimeReportStatus.ApprovedByCustomer
            )
          )
    },
    {
      header: "Konsult e-post",
      setCell: ({ cell, row, styles }) =>
        cell.string(row.bookingWeek.consultantSearch?.Email || "")
    },
    {
      header: "Avbokningsdatum",
      setCell: ({ cell, row }) =>
        cell.string(
          row.bookingWeek.canceled?.date
            ? moment.utc(row.bookingWeek.canceled?.date).format("L")
            : ""
        )
    },
    {
      header: "Avbokad av",
      setCell: ({ cell, row }) =>
        cell.string(row.bookingWeek.canceled?.userRef?.Name ?? "")
    },
    {
      header: "Skäl till avbokning",
      setCell: ({ cell, row }) => cell.string(row.bookingWeek.canceled?.reason ?? "")
    },
    {
      header: locale.TotalGr,
      setColumn: ({ column }) => column.setWidth(20),
      setCell: ({ cell, row, styles }) =>
        isNumber(row.bookingWeek.invoicedTotal)
          ? cell.style(styles.sekField).number(row.bookingWeek.invoicedTotal)
          : ""
    }
  ];

  if (withProfit) {
    columns.push({
      header: "Vite",
      dataKey: "fine",
      setColumn: ({ column }) => column.setWidth(20),
      setCell: ({ cell, row }) => {
        if (!isNumber(row.bookingWeek.customerFine)) {
          return "";
        }

        return cell.number(row.bookingWeek.customerFine);
      }
    });

    columns.push({
      header: "Underleverantörsfaktura/lön",
      setCell: ({ cell, row, styles }) => {
        let value;

        if (row.bookingWeek.costs instanceof EmployeeBookingCosts) {
          value = row.bookingWeek.costs.salary;
        }

        if (row.bookingWeek.costs instanceof SubcontractorBookingCosts) {
          value = row.bookingWeek.costs.invoiceTotal;
        }

        if (isNumber(value)) {
          cell.style(styles.sekField).number(value);
        }
      }
    });

    columns.push({
      header: "Resa",
      setCell: ({ cell, row, styles }) => {
        if (!isNumber(row.bookingWeek.costs?.travel)) {
          return;
        }

        return cell.style(styles.sekField).number(row.bookingWeek.costs.travel);
      }
    });

    columns.push({
      header: "Boende",
      setCell: ({ cell, row, styles }) => {
        if (!isNumber(row.bookingWeek.costs?.accommodation)) {
          return;
        }

        return cell.style(styles.sekField).number(row.bookingWeek.costs.accommodation);
      }
    });

    columns.push({
      header: "TB1",
      dataKey: "tb1",
      setColumn: ({ column }) => column.setWidth(20),
      setCell: ({ cell, row, styles }) =>
        row.bookingWeek.profitNet
          ? cell.style(styles.sekField).number(row.bookingWeek.profitNet)
          : ""
    });

    columns.push({
      header: "TG",
      dataKey: "tg",
      setColumn: ({ column }) => column.setWidth(20),
      setCell: ({ cell, row }) => {
        if (!isNumber(row.bookingWeek.profitRatio)) {
          return "";
        }

        return cell.number(row.bookingWeek.profitRatio);
      }
    });
  }

  return columns;
}

function yesNo(v: boolean) {
  return v ? locale.Yes : locale.No;
}
