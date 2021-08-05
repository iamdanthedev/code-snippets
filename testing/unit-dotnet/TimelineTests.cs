using System;
using System.Linq;
using Util.Time;
using Util.Timeline;
using Xunit;

namespace UtilTests.Timeline
{
    public class TimelineTests
    {
        [Fact]
        public void GroupConsecutiveByTest()
        {
            var range = new DateRange(new DateTime(2021, 07, 12), new DateTime(2021, 07, 19));
            var timeline = new Timeline<TestPayload>(range.Start, range.End, 60 * 60 * 24);

            timeline.Units.Add(new TimelineUnit<TestPayload>() {Payload = new TestPayload("First")});
            timeline.Units.Add(new TimelineUnit<TestPayload>() {Payload = new TestPayload("First")});
            timeline.Units.Add(new TimelineUnit<TestPayload>() {Payload = new TestPayload("First")});
            timeline.Units.Add(new TimelineUnit<TestPayload>());
            timeline.Units.Add(new TimelineUnit<TestPayload>() {Payload = new TestPayload("Second")});
            timeline.Units.Add(new TimelineUnit<TestPayload>() {Payload = new TestPayload("Second")});
            timeline.Units.Add(new TimelineUnit<TestPayload>());

            var groupConsecutiveBy = timeline.GroupConsecutiveBy((unit, index) => unit.Payload?.Title).ToList();

            Assert.Equal(2, groupConsecutiveBy.Count);
        }

        [Fact]
        public void GroupConsecutiveByTest1()
        {
            var range = new DateRange(new DateTime(2021, 07, 12), new DateTime(2021, 07, 19));
            var timeline = new Timeline<TestPayload>(range.Start, range.End, 60 * 60 * 24);

            timeline.Units.Add(new TimelineUnit<TestPayload>() {Payload = new TestPayload("First")});
            timeline.Units.Add(new TimelineUnit<TestPayload>() {Payload = new TestPayload("First")});
            timeline.Units.Add(new TimelineUnit<TestPayload>() {Payload = new TestPayload("First")});
            timeline.Units.Add(new TimelineUnit<TestPayload>());
            timeline.Units.Add(new TimelineUnit<TestPayload>());
            timeline.Units.Add(new TimelineUnit<TestPayload>() {Payload = new TestPayload("Second")});
            timeline.Units.Add(new TimelineUnit<TestPayload>() {Payload = new TestPayload("Second")});

            var groupConsecutiveBy = timeline.GroupConsecutiveBy((unit, index) => unit.Payload?.Title).ToList();

            Assert.Equal(2, groupConsecutiveBy.Count);
        }
    }

    public record TestPayload (string Title);
}
