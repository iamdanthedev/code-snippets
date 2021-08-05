using System;

namespace Util.Time
{
    public static class DateTimeUtils
    {
        public static DateTime Clamp(this DateTime dt, DateTime min, DateTime max)
        {
            if (dt < min)
                return min;

            if (dt > max)
                return max;

            return dt;
        }
    }
}