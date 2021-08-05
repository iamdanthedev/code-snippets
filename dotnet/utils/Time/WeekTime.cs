using System;

namespace Util.Time
{
    public class WeekTime
    {
        public WeekTime(DayOfWeek dayOfWeek, DayTime dayTime)
        {
            DayOfWeek = dayOfWeek;
            DayTime = dayTime;
        }
        
        public WeekTime(DayOfWeek dayOfWeek, string dayTime)
        {
            DayOfWeek = dayOfWeek;
            DayTime = DayTime.Parse(dayTime);
        }

        public DayOfWeek DayOfWeek { get; set; }
        public DayTime DayTime { get; set; }
    }
}