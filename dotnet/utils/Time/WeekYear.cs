using System;
using System.Globalization;

namespace Util.Time
{
    public class WeekYear
    {
        /// <summary>
        /// Check if week/year values are correct
        /// </summary>
        /// <param name="week"></param>
        /// <param name="year"></param>
        /// <exception cref="InvalidWeekYearParamsException"></exception>
        public static void AssertWeekYear(int week, int year)
        {
            if (week < 1 || week > 53 || year < 1900 || year > 2100)
            {
                throw new InvalidWeekYearParamsException(week, year);
            }
        }

        public WeekYear(DateTime dateTime)
        {
            Week = ISOWeek.GetWeekOfYear(dateTime);
            Year = ISOWeek.GetYear(dateTime);
        }
        
        public WeekYear(int week, int year)
        {
            Week = week;
            Year = year;
        }
        
        public int Year { get; }
        public int Week { get; }

        public DateTime ToUtcDate()
        {
            var dt = ISOWeek.ToDateTime(Year, Week, DayOfWeek.Monday);
            var dtUtc = new DateTime(dt.Year, dt.Month, dt.Day, 0, 0, 0, DateTimeKind.Utc);
            return dtUtc;
        }
    }

    public static class DateTimeExtensions
    {
        public static WeekYear WeekYear(this DateTime dt)
        {
            return new WeekYear(dt);
        }
    }

    public class InvalidWeekYearParamsException : Exception
    {
        public InvalidWeekYearParamsException(int week, int year) : base(
            $"invalid weekyear params: week {week}, year {year}")
        {
        }
    }
}