using System.Linq;
using CustomerContract.CustomerContractOption.Interface;
using Util.Time;

namespace CustomerContract.CustomerContractOption.ScheduleStrategy
{
    public class DayBeforeHolidayDayAfterHolidayScheduleStrategy : IScheduleStrategy
    {
        public DayBeforeHolidayDayAfterHolidayScheduleStrategy(DayTimeRange dayTimeRange)
        {
            DayTimeRange = dayTimeRange;
        }

        public DayTimeRange DayTimeRange { get; set; }

        public bool IsApplicableToTimespan(uint unitStart, uint unitEnd, IContractCalendar workCalendar,
            IScheduleStrategyContext contractContext)
        {
            var unitInterval = new Interval(unitStart, unitEnd);

            var holidays = workCalendar.GetHolidaysBetween(contractContext.CalculationPeriod.StartDateTime,
                contractContext.CalculationPeriod.EndDateTime);

            var holidayRanges = holidays.Select(x => DayTimeRange.GetDateRange(x));

            return holidayRanges.Any(x => x.Contains(unitInterval));
        }
    }
}