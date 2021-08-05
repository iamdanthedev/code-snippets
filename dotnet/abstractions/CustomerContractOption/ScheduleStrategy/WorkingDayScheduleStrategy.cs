using System;
using System.Collections.Generic;
using System.Linq;
using CustomerContract.CustomerContractOption.Interface;
using Util.Time;

namespace CustomerContract.CustomerContractOption.ScheduleStrategy
{
    /// <summary>
    /// e.g. Vardagar 10am - 2pm
    /// </summary>
    public class WorkingDayScheduleStrategy : IScheduleStrategy
    {
        public WorkingDayScheduleStrategy(DayTimeRange dayTimeRange)
        {
            DayTimeRange = dayTimeRange;
        }

        public DayTimeRange DayTimeRange { get; }

        public bool IsApplicableToTimespan(uint unitStart, uint unitEnd, IContractCalendar cal,
            IScheduleStrategyContext ctx)
        {
            var unitInterval = new Interval(unitStart, unitEnd);
            var workingDays = GetWorkingDays(cal, ctx);
            var workingRanges = workingDays.Select(x => DayTimeRange.GetDateRange(x));

            return workingRanges.Any(x => x.Contains(unitInterval));
        }

        private List<DateTime> GetWorkingDays(IContractCalendar cal, IScheduleStrategyContext contractContext)
        {
            var current = cal.GetNextWorkingDayAfter(contractContext.CalculationPeriod.StartDateTime, true);
            var result = new List<DateTime>();

            while (current <= contractContext.CalculationPeriod.EndDateTime)
            {
                result.Add(current);
                current = cal.GetNextWorkingDayAfter(current, false);
            }

            return result;
        }
    }
}