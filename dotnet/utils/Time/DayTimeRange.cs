using System;
using System.Collections.Generic;

namespace Util.Time
{
    public class DayTimeRange
    {
        public DayTime Start { get; }

        public DayTime End { get; }

        public DayTimeRange(int start, int end) : this(new DayTime(start),
            new DayTime(end))
        {
        }

        public DayTimeRange(uint start, uint end) : this(new DayTime(start),
            new DayTime(end))
        {
        }

        public DayTimeRange(string start, string end) : this(DayTime.Parse(start),
            DayTime.Parse(end))
        {
        }

        public DayTimeRange(DayTime start, DayTime end)
        {
            Start = start;
            End = end;
        }

        public DateRange GetDateRange(DateTime date)
        {
            var end = End.Seconds <= Start.Seconds
                ? End.ToDayTimeUtc(date.Add(TimeSpan.FromDays(1)))
                : End.ToDayTimeUtc(date);

            return new DateRange(Start.ToDayTimeUtc(date), end);
        }

        public DateRange GetDateRange(DateRange dateRange)
        {
            if (dateRange.StartDateTime.TimeOfDay.TotalSeconds >
                Start.ToDayTimeUtc(dateRange.StartDateTime.Date).TimeOfDay.TotalSeconds &&
                dateRange.StartDateTime.Day < dateRange.EndDateTime.Day)
            {
                return new DateRange(Start.ToDayTimeUtc(dateRange.StartDateTime.Date.Add(TimeSpan.FromDays(1))),
                    End.ToDayTimeUtc(dateRange.StartDateTime.Date.Add(TimeSpan.FromDays(1))));
            }

            if (dateRange.EndDateTime.TimeOfDay.TotalSeconds >
                End.ToDayTimeUtc(dateRange.EndDateTime).TimeOfDay.TotalSeconds &&
                dateRange.StartDateTime.Day < dateRange.EndDateTime.Day)
            {
                return new DateRange(Start.ToDayTimeUtc(dateRange.StartDateTime.Date),
                    End.ToDayTimeUtc(dateRange.StartDateTime.Date.Add(TimeSpan.FromDays(1))));
            }

            return new DateRange(Start.ToDayTimeUtc(dateRange.StartDateTime.Date),
                End.ToDayTimeUtc(dateRange.StartDateTime.Date));
        }

        public bool Contains(DayTimeRange b)
        {
            return Start.Seconds <= b.Start.Seconds && End.Seconds >= b.End.Seconds;
        }

        public override string ToString()
        {
            return $"{Start} - {End}";
        }
    }

    public static class DateTimeExtension
    {
        public static DayTime ToDayTime(this DateTime dateTime)
        {
            var span = dateTime - dateTime.Date;
            return new DayTime((int) span.TotalSeconds);
        }
    }
}