using Util.Time;

namespace CustomerContract.CustomerContractOption.Interface
{
    /// <summary>
    /// defines the way contract option is applied to the schedule
    /// </summary>
    public interface IScheduleStrategy
    {
        // todo: AppliesToTimespan(from, to): Boolean
        bool IsApplicableToTimespan(
            uint unitStart,
            uint unitEnd,
            IContractCalendar workCalendar,
            IScheduleStrategyContext contractContext);
    }

    public interface IScheduleStrategyContext
    {
        DateRange CalculationPeriod { get; }
    }
}