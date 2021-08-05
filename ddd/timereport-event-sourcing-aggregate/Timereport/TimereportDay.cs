using System;
using System.Collections.Generic;
using System.Linq;
using MongoDB.Bson.Serialization.Attributes;
using Util.Time;

namespace Domain.Timereport
{
    public class TimereportDay
    {
        public DateTime Date { get; set; }

        public DayTimeRange? WorkTimeRange { get; set; }
        public DayTimeRange? SickTimeRange { get; set; }
        public DayTimeRange? VabTimeRange { get; set; }
        public List<OnCallShift> OnCallShifts { get; set; } = new();
        public List<PreparednessAShift> PreparednessAShifts { get; set; } = new();
        public List<PreparednessBShift> PreparednessBShifts { get; set; } = new();

        public int ConsultantLunchMinutes { get; set; }
        public string ConsultantComment { get; set; }

        public int ConsultantMileage { get; set; }

        // public Money? ConsultantExpenses { get; set; }
        public List<TimereportExpense> ConsultantExpenses { get; set; } = new();

        public TimereportDay(DateTime date)
        {
            if (date.Kind != DateTimeKind.Utc)
            {
                throw new Exception("date must be in UTC time zone");
            }

            Date = date.Date;
            ConsultantComment = "";
            ConsultantLunchMinutes = 0;
            ConsultantMileage = 0;
        }

        public decimal TotalExpenses => ConsultantExpenses.Sum(x => x.Amount);

        public bool IsBlank()
        {
            if (WorkTimeRange != null) return false;
            if (SickTimeRange != null) return false;
            if (VabTimeRange != null) return false;
            if (OnCallShifts.Any()) return false;
            if (PreparednessAShifts.Any()) return false;
            if (PreparednessBShifts.Any()) return false;
            if (ConsultantExpenses.Any()) return false;
            if (ConsultantLunchMinutes > 0) return false;
            if (ConsultantMileage > 0) return false;
            if (!string.IsNullOrEmpty(ConsultantComment)) return false;

            return true;
        }
    }

    public class OnCallShift : IShift
    {
        public DayTimeRange TimeRange { get; set; }
        public List<OnCallPassivePeriod> PassivePeriods { get; set; } = new List<OnCallPassivePeriod>();

        public OnCallShift(DayTimeRange timeRange)
        {
            TimeRange = timeRange;
        }

        public List<DateRange> GetActivePeriods(DateTime day)
        {
            var passiveIntervals = PassivePeriods
                .Select(x => x.TimeRange.GetDateRange(TimeRange.GetDateRange(day)) as Interval)
                .ToList();
            return TimeRange.GetDateRange(day)
                .SubtractMany(passiveIntervals)
                .Select(DateRange.FromInterval)
                .ToList();
        }

        public List<DateRange> GetPassivePeriods(DateTime day)
        {
            return PassivePeriods.Select(x => x.TimeRange.GetDateRange(TimeRange.GetDateRange(day))).ToList();
        }
    }

    public class OnCallPassivePeriod
    {
        public OnCallPassivePeriod(DayTimeRange timeRange)
        {
            TimeRange = timeRange;
        }

        public DayTimeRange TimeRange { get; private set; }
    }

    public class PreparednessAShift : IShift
    {
        public DayTimeRange TimeRange { get; set; }
        public List<PreparednessActivePeriod> ActivePeriods { get; set; } = new List<PreparednessActivePeriod>();

        public PreparednessAShift(DayTimeRange timeRange)
        {
            TimeRange = timeRange;
        }

        public List<DateRange> GetPassivePeriods(DateTime day)
        {
            var activeIntervals = ActivePeriods
                .Select(x => x.TimeRange.GetDateRange(TimeRange.GetDateRange(day)) as Interval)
                .ToList();
            return TimeRange.GetDateRange(day)
                .SubtractMany(activeIntervals)
                .Select(DateRange.FromInterval)
                .ToList();
        }

        public List<DateRange> GetActivePeriods(DateTime day)
        {
            return ActivePeriods.Select(x => x.TimeRange.GetDateRange(TimeRange.GetDateRange(day))).ToList();
        }
    }

    public class PreparednessBShift : IShift
    {
        public DayTimeRange TimeRange { get; set; }
        public List<PreparednessActivePeriod> ActivePeriods { get; set; } = new List<PreparednessActivePeriod>();

        public PreparednessBShift(DayTimeRange timeRange)
        {
            TimeRange = timeRange;
        }

        public List<DateRange> GetPassivePeriods(DateTime day)
        {
            var activeIntervals = ActivePeriods
                .Select(x => x.TimeRange.GetDateRange(TimeRange.GetDateRange(day)) as Interval)
                .ToList();
            return TimeRange.GetDateRange(day)
                .SubtractMany(activeIntervals)
                .Select(DateRange.FromInterval)
                .ToList();
        }

        public List<DateRange> GetActivePeriods(DateTime day)
        {
            return ActivePeriods.Select(x => x.TimeRange.GetDateRange(day)).ToList();
        }
    }

    public class PreparednessActivePeriod
    {
        public PreparednessActivePeriod(DayTimeRange timeRange)
        {
            TimeRange = timeRange;
        }

        [BsonElement("timeRange")]
        public DayTimeRange TimeRange { get; set; }
    }

    public class TimereportExpense
    {
        public decimal Amount { get; set; }
        public string Comment { get; set; }
    }

    public interface IShift
    {
        public List<DateRange> GetActivePeriods(DateTime day);
        public List<DateRange> GetPassivePeriods(DateTime day);
    }
}