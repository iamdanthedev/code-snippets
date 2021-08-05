using System;
using System.Collections.Generic;

namespace CustomerContract.CustomerContractOption.Interface
{
    public interface IContractCalendar
    {
        DateTime GetNextWorkingDayAfter(DateTime dt, bool includeSameDay);
        
        bool IsHoliday(DateTime dt);
        bool IsGreatHoliday(DateTime dt);

        IEnumerable<DateTime> GetHolidaysBetween(DateTime from, DateTime to);
        IEnumerable<DateTime> GetAllGreatHolidays(DateTime from, DateTime to);
    }
}