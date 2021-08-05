using System;
using System.Collections.Generic;
using System.Linq;
using PublicHoliday;

namespace Util.Time
{
    public static class HolidayDateTimeExtension
    {
        public static List<DateTime> GetDaysAgoIncludingHolidays(this DateTime dt, int days)
        {
            var sw = new SwedenPublicHoliday();
            
            var to = dt.Subtract(TimeSpan.FromDays(days));

            if (sw.IsWorkingDay(to))
            {
                return new List<DateTime> { to };
            }

            var from = sw.PreviousWorkingDay(to);

            return EachDay(from, to).ToList();
        }

        public static IEnumerable<DateTime> EachDay(DateTime from, DateTime thru)
        {
            for(var day = from.Date; day.Date <= thru.Date; day = day.AddDays(1))
                yield return day;
        }
    }
}