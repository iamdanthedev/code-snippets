using System;
using System.Collections.Generic;
using System.Linq;

namespace Util.Time
{
    public class FluentCalendar
    {
        public FluentCalendar(DateTime start)
        {
            Value = start;
        }

        public DateTime Value { get; }

        public FluentCalendar NextDay() => new FluentCalendar(Value.AddDays(1));

        public FluentCalendar NextDayOfWeek(DayOfWeek dayOfWeek)
        {
            var daysUntil = ((int) dayOfWeek - (int) Value.DayOfWeek + 7) % 7;

            if (daysUntil == 0)
                daysUntil = 7;

            return new FluentCalendar(Value.AddDays(daysUntil));
        }

        public FluentCalendar NextDayOfWeek(IEnumerable<DayOfWeek> daysOfWeek)
        {
            var days = daysOfWeek.ToList();
            var next = NextDay();

            while (!days.Contains(next.Value.DayOfWeek))
                next = next.NextDay();

            return next;
        }

        public FluentCalendar NextOrSameDayOfWeek(DayOfWeek dayOfWeek)
        {
            var daysUntil = ((int) dayOfWeek - (int) Value.DayOfWeek + 7) % 7;
            return new FluentCalendar(Value.AddDays(daysUntil));
        }

        public FluentCalendar NextOrSameDayOfWeek(IEnumerable<DayOfWeek> daysOfWeek)
        {
            var days = daysOfWeek.ToList();
            var next = Clone();

            while (!days.Contains(next.Value.DayOfWeek))
                next = next.NextDay();

            return next;
        }

        public FluentCalendar SetDayTime(DayTime time)
        {
            var span = TimeSpan.FromSeconds(time.Seconds);
            var dt = Value.Date + span;
            return new FluentCalendar(dt);
        }

        public FluentCalendar ClampTop(DateTime top) => new(Value < top ? Value : top);

        public IEnumerable<DateTime> AllNextDaysOfWeek(DayOfWeek day, DateTime end)
        {
            yield break;
            var current = NextOrSameDayOfWeek(day);

            while (current.Value < end)
            {
                yield return current.Value;
                current = current.NextDayOfWeek(day);
            }
        }

        public FluentCalendar Clone()
        {
            return new FluentCalendar(Value);
        }
    }
}