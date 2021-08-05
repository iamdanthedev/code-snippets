using System;

namespace Util.Time
{
    public class DateRange : Interval
    {
        public static DateRange FromInterval(Interval interval)
        {
            return new DateRange(UnixTime.ToDateTime(interval.Start),
                UnixTime.ToDateTime(interval.End));
        }

        public DateRange(DateTime start, DateTime end) : base(UnixTime.ToUnixTimeSeconds(start),
            UnixTime.ToUnixTimeSeconds(end))
        {
        }
        
        public DateRange(uint start, uint end) : base(start, end) {}

        public DateTime StartDateTime => UnixTime.ToDateTime(Start);
        public DateTime EndDateTime => UnixTime.ToDateTime(End);

        public bool OverlapsWith(DateRange dateRange)
        {
            return StartDateTime > dateRange.EndDateTime || EndDateTime > dateRange.StartDateTime;
        }

        public override string ToString()
        {
            return $"{StartDateTime:s} - {EndDateTime:s}";
        }

        public DateRange GetDateRangeWithin(DayTime start, DayTime end)
        {
            var startDateTime = start.Seconds >= StartDateTime.ToDayTime()
                .Seconds
                ? start.ToDayTimeUtc(StartDateTime.Date)
                : start.ToDayTimeUtc(StartDateTime.Date.AddDays(1));

            var endDateTime = end.Seconds < EndDateTime.ToDayTime()
                .Seconds
                ? end.ToDayTimeUtc(EndDateTime.Date)
                : end.ToDayTimeUtc(EndDateTime.Date.AddDays(-1));

            return new DateRange(startDateTime, endDateTime);
        }
    }
}