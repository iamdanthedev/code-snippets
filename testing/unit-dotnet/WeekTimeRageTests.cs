using System;
using Util.Time;
using Xunit;

namespace UtilTests.Time
{
    public class WeekTimeRangeTests
    {
        // e.g. mon-wed
        public class DirectTests
        {
            [Fact]
            public void ShouldExtractNoPartial1()
            {
                var s = new WeekTime(DayOfWeek.Monday, DayTime.Parse("09:00"));
                var e = new WeekTime(DayOfWeek.Wednesday, DayTime.Parse("12:00"));
                var r = new WeekTimeRange(s, e);

                var fullRange = new DateRange(new DateTime(2021, 07, 12), new DateTime(2021, 07, 26));
                var ranges = r.Extract(fullRange, false);

                Assert.Equal(2, ranges.Count);
                Assert.Equal(new DateTime(2021, 07, 12, 9, 0, 0), ranges[0].StartDateTime);
                Assert.Equal(new DateTime(2021, 07, 14, 12, 0, 0), ranges[0].EndDateTime);
                Assert.Equal(new DateTime(2021, 07, 19, 9, 0, 0), ranges[1].StartDateTime);
                Assert.Equal(new DateTime(2021, 07, 21, 12, 0, 0), ranges[1].EndDateTime);
            }

            [Fact]
            public void ShouldExtractWithPartial1()
            {
                var s = new WeekTime(DayOfWeek.Monday, DayTime.Parse("09:00"));
                var e = new WeekTime(DayOfWeek.Wednesday, DayTime.Parse("12:00"));
                var r = new WeekTimeRange(s, e);

                var fullRange = new DateRange(new DateTime(2021, 07, 12), new DateTime(2021, 07, 21));
                var ranges = r.Extract(fullRange, true);

                Assert.Equal(2, ranges.Count);
                Assert.Equal(new DateTime(2021, 07, 12, 9, 0, 0), ranges[0].StartDateTime);
                Assert.Equal(new DateTime(2021, 07, 14, 12, 0, 0), ranges[0].EndDateTime);
                Assert.Equal(new DateTime(2021, 07, 19, 9, 0, 0), ranges[1].StartDateTime);
                Assert.Equal(new DateTime(2021, 07, 21, 0, 0, 0), ranges[1].EndDateTime);
            }
        }

        // e.g. fri-mon
        public class ReversedTests
        {
            [Fact]
            public void ShouldExtractNoPartial1()
            {
                var s = new WeekTime(DayOfWeek.Friday, DayTime.Parse("19:00"));
                var e = new WeekTime(DayOfWeek.Monday, DayTime.Parse("07:00"));
                var r = new WeekTimeRange(s, e);

                var fullRange = new DateRange(new DateTime(2021, 7, 12), new DateTime(2021, 8, 2));
                var ranges = r.Extract(fullRange, false);

                Assert.Equal(2, ranges.Count);
                Assert.Equal(new DateTime(2021, 07, 16, 19, 0, 0), ranges[0].StartDateTime);
                Assert.Equal(new DateTime(2021, 07, 19, 7, 0, 0), ranges[0].EndDateTime);
                Assert.Equal(new DateTime(2021, 07, 23, 19, 0, 0), ranges[1].StartDateTime);
                Assert.Equal(new DateTime(2021, 07, 26, 7, 0, 0), ranges[1].EndDateTime);
            }

        }

    }
}
