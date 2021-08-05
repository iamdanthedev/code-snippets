using System.Linq;
using CustomerContract.CustomerContractOption.Interface;
using Util.Time;

namespace CustomerContract.CustomerContractOption.ScheduleStrategy
{
    /// <summary>
    /// e.g. Mon 8am - Wed 12pm
    ///      Fri 7pm - Mon 7am
    /// </summary>
    public class WeeklyPeriodScheduleStrategy : IScheduleStrategy
    {
        public WeekTime Start { get; set; }
        public WeekTime End { get; set; }

        private WeekTimeRange _weekTimeRange;

        public WeeklyPeriodScheduleStrategy(WeekTime start, WeekTime end)
        {
            Start = start;
            End = end;

            _weekTimeRange = new WeekTimeRange(Start, End);
        }

        public bool IsApplicableToTimespan(uint unitStart, uint unitEnd, IContractCalendar workCalendar,
            IScheduleStrategyContext contractContext)
        {
            var periods = _weekTimeRange.Extract(contractContext.CalculationPeriod, true);
            var unitInterval = new Interval(unitStart, unitEnd);

            return periods.Any(x => x.Contains(unitInterval));
        }
    }
}