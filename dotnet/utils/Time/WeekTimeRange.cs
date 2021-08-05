using System.Collections.Generic;

namespace Util.Time
{
    public class WeekTimeRange
    {
        public WeekTimeRange(WeekTime start, WeekTime end)
        {
            Start = start;
            End = end;
        }

        private WeekTime Start { get; }
        private WeekTime End { get; }

        public List<DateRange> Extract(DateRange range, bool allowPartialRange)
        {
            var result = new List<DateRange>();

            var cal = new FluentCalendar(range.StartDateTime);

            var nextStart = cal.NextOrSameDayOfWeek(Start.DayOfWeek).SetDayTime(Start.DayTime);
            var nextEnd = nextStart.NextDayOfWeek(End.DayOfWeek).SetDayTime(End.DayTime);

            while (nextStart.Value < range.EndDateTime && nextEnd.Value <= range.EndDateTime)
            {
                result.Add(new DateRange(nextStart.Value, nextEnd.Value));

                nextStart = nextStart.NextDayOfWeek(Start.DayOfWeek).SetDayTime(Start.DayTime);
                nextEnd = nextStart.NextDayOfWeek(End.DayOfWeek).SetDayTime(End.DayTime);

                if (allowPartialRange)
                    nextEnd = nextEnd.ClampTop(range.EndDateTime);
            }


            return result;
        }
    }
}