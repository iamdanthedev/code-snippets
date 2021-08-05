using System;
using System.Linq;
using CustomerContract.CustomerContractOption.Interface;
using Util.Time;

namespace CustomerContract.CustomerContractOption.ScheduleStrategy
{
    public class WeekDayScheduleStrategy : IScheduleStrategy
    {
        public DayOfWeek Day { get; }
        public DayTimeRange DayTimeRange { get; }

        public WeekDayScheduleStrategy(DayOfWeek day, DayTimeRange dayTimeRange)
        {
            Day = day;
            DayTimeRange = dayTimeRange;
        }

        public bool IsApplicableToTimespan(uint unitStart, uint unitEnd, IContractCalendar workCalendar,
            IScheduleStrategyContext contractContext)
        {
            var unitInterval = new Interval(unitStart, unitEnd);
            var cal = new FluentCalendar(contractContext.CalculationPeriod.StartDateTime);
            var days = cal.AllNextDaysOfWeek(Day, contractContext.CalculationPeriod.EndDateTime);
            var ranges = days.Select(x => DayTimeRange.GetDateRange(x));

            return ranges.Any(x => x.Contains(unitInterval));
        }
    }
}