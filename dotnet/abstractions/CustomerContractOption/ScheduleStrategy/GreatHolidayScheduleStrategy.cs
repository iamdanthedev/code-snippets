using System.Linq;
using CustomerContract.CustomerContractOption.Interface;
using Util.Time;

namespace CustomerContract.CustomerContractOption.ScheduleStrategy
{
    /// <summary>
    /// e.g. Storhelg 0:00 - 24:00
    /// </summary>
    public class GreatHolidayScheduleStrategy : IScheduleStrategy
    {
        public DayTimeRange DayTimeRange { get; }

        public GreatHolidayScheduleStrategy(DayTimeRange dayTimeRange)
        {
            DayTimeRange = dayTimeRange;
        }

        public bool IsApplicableToTimespan(uint unitStart, uint unitEnd, IContractCalendar workCalendar,
            IScheduleStrategyContext contractContext)
        {
            var unitInterval = new Interval(unitStart, unitEnd);

            var greatHolidays = workCalendar.GetAllGreatHolidays(
                contractContext.CalculationPeriod.StartDateTime, contractContext.CalculationPeriod.EndDateTime);

            var ranges = greatHolidays.Select(x => DayTimeRange.GetDateRange(x));

            return ranges.Any(x => x.Contains(unitInterval));
        }
    }
}