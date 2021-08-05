using System.Collections.Generic;
using System.Linq;
using Domain.Timereport.Aggregate;

namespace Domain.Timereport.TimereportSummary
{
    public static class TimereportDayExtension
    {
        public static double TotalActiveMinutes(this TimereportDay day)
        {
            double result = 0;

            foreach (var record in day.SummaryRecords())
            {
                result += record.ActiveTimeTotal;

                result -= record.LunchTimeTotal;
                result -= record.SickTimeTotal;
                result -= record.VabTimeTotal;
            }

            return result;
        }
        
        public static IEnumerable<TimereportSummaryRecord> SummaryRecords(this TimereportDay day)
        {
            List<TimereportSummaryRecord> records = new();

            if (day.WorkTimeRange != null)
            {
                var workTimeRange = day.WorkTimeRange.GetDateRange(day.Date);
                var timeSpan = workTimeRange.EndDateTime - workTimeRange.StartDateTime;
                var workTimeRecord = new TimereportSummaryRecord
                {
                    Type = TimereportWorkType.Work,
                    ActiveTimeTotal = timeSpan.TotalMinutes
                };

                if (day.ConsultantLunchMinutes > 0)
                {
                    workTimeRecord.LunchTimeTotal = day.ConsultantLunchMinutes;
                }

                if (day.SickTimeRange != null)
                {
                    var sickTimeRange = day.SickTimeRange.GetDateRange(day.Date);
                    timeSpan = sickTimeRange.EndDateTime - sickTimeRange.StartDateTime;
                    workTimeRecord.SickTimeTotal = timeSpan.TotalMinutes;
                }

                if (day.VabTimeRange != null)
                {
                    var vabTimeRange = day.VabTimeRange.GetDateRange(day.Date);
                    timeSpan = vabTimeRange.EndDateTime - vabTimeRange.StartDateTime;
                    workTimeRecord.VabTimeTotal = timeSpan.TotalMinutes;
                }

                records.Add(workTimeRecord);
            }

            if (day.OnCallShifts.Count > 0)
            {
                records.Add(new TimereportSummaryRecord()
                {
                    Type = TimereportWorkType.OnCall,
                    ActiveTimeTotal = day.TotalActiveHours(day.OnCallShifts),
                    PassiveTimeTotal = day.TotalPassiveHours(day.OnCallShifts)
                });
            }

            if (day.PreparednessAShifts.Count > 0)
            {
                records.Add(new TimereportSummaryRecord()
                {
                    Type = TimereportWorkType.PreparednessA,
                    ActiveTimeTotal = day.TotalActiveHours(day.PreparednessAShifts),
                    PassiveTimeTotal = day.TotalPassiveHours(day.PreparednessAShifts)
                });
            }

            if (day.PreparednessBShifts.Count > 0)
            {
                records.Add(new TimereportSummaryRecord()
                {
                    Type = TimereportWorkType.PreparednessB,
                    ActiveTimeTotal = day.TotalActiveHours(day.PreparednessBShifts),
                    PassiveTimeTotal = day.TotalPassiveHours(day.PreparednessBShifts)
                });
            }

            return records;
        }

        public static double TotalActiveHours<T>(this TimereportDay day, IEnumerable<T> shifts) where T : IShift
        {
            return shifts.Sum(shift => shift.GetActivePeriods(day.Date)
                .Sum(x =>
                {
                    var timeSpan = x.EndDateTime - x.StartDateTime;
                    return timeSpan.TotalMinutes;
                }));
        }

        public static double TotalPassiveHours<T>(this TimereportDay day, IEnumerable<T> shifts) where T : IShift
        {
            return shifts.Sum(shift => shift.GetPassivePeriods(day.Date)
                .Sum(x =>
                {
                    var timeSpan = x.EndDateTime - x.StartDateTime;
                    return timeSpan.TotalMinutes;
                }));
        }
    }
}