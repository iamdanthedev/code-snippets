using System;
using System.Linq;
using Util.Time;
using Xunit;

namespace UtilTests.Time
{
    public class FluentCalendarTests
    {
        [Fact]
        public void ShouldFindNextMonday1()
        {
            var current = new DateTime(2021, 07, 26); // monday
            var cal = new FluentCalendar(current);
            var nextMonday = cal.NextDayOfWeek(DayOfWeek.Monday).Value;
            Assert.Equal(new DateTime(2021, 08, 02), nextMonday);
        }

        [Fact]
        public void ShouldFindNextMonday2()
        {
            var current = new DateTime(2021, 07, 27); // tue
            var cal = new FluentCalendar(current);
            var nextMonday = cal.NextDayOfWeek(DayOfWeek.Monday).Value;
            Assert.Equal(new DateTime(2021, 08, 02), nextMonday);
        }

        [Fact]
        public void ShouldFindNextWed1()
        {
            var current = new DateTime(2021, 07, 29); // thu
            var cal = new FluentCalendar(current);
            var nextMonday = cal.NextDayOfWeek(DayOfWeek.Wednesday).Value;
            Assert.Equal(new DateTime(2021, 08, 04), nextMonday);
        }

        [Fact]
        public void ShouldFindNextWed2()
        {
            var current = new DateTime(2021, 8, 1); // sun
            var cal = new FluentCalendar(current);
            var nextMonday = cal.NextDayOfWeek(DayOfWeek.Wednesday).Value;
            Assert.Equal(new DateTime(2021, 08, 04), nextMonday);
        }

        [Fact]
        public void AllNextDaysOfWeek1()
        {
            var current = new DateTime(2021, 7, 12);
            var cal = new FluentCalendar(current);
            var nextMondays = cal.AllNextDaysOfWeek(DayOfWeek.Monday, new DateTime(2021, 07, 28)).ToList();
            Assert.Equal(3, nextMondays.Count);
        }

        [Fact]
        public void AllNextDaysOfWeek2()
        {
            var current = new DateTime(2021, 7, 12);
            var cal = new FluentCalendar(current);
            var nextMondays = cal.AllNextDaysOfWeek(DayOfWeek.Wednesday, new DateTime(2021, 07, 28)).ToList();
            Assert.Equal(2, nextMondays.Count);
        }

    }
}
