using System;

namespace Util.Time
{
    public static class UnixTime
    {
        public static uint ToUnixTimeSeconds(DateTime date)
        {
            DateTime point = new DateTime(1970, 1, 1);
            TimeSpan time = date.Subtract(point);

            return (uint) time.TotalSeconds;
        }

        public static uint ToUnixTimeSeconds()
        {
            return ToUnixTimeSeconds(DateTime.UtcNow);
        }

        public static DateTime ToDateTime(uint unixTimeStamp)
        {
            var dateTime = new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc);
            dateTime = dateTime.AddSeconds(unixTimeStamp);
            return dateTime;
        }

        public static uint TotalSecondsFromDayStart(uint unixTimeStamp)
        {
            var date = ToDateTime(unixTimeStamp);
            var dateZeroTime = new DateTime(date.Year, date.Month, date.Day, 0, 0, 0);
            var timeSpan = date - dateZeroTime;

            return (uint) timeSpan.TotalSeconds;
        }

        public static uint ToUnixTime(this DateTime dt)
        {
            return UnixTime.ToUnixTimeSeconds(dt);
        }
    }
}