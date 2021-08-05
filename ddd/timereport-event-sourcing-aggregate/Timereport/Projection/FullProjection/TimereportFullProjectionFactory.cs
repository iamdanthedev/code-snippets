using System.Collections.Generic;
using System.Linq;
using Framework.Events;
using MongoDB.Bson;
using Util.Time;

namespace Domain.Timereport.Projection.FullProjection
{
    public static class TimereportFullProjectionFactory
    {
        public static TimereportFullProjection Create(Aggregate.TimereportAggregate aggregate, IEnumerable<Event> events)
        {
            var weekYear = new WeekYear(aggregate.StartsOnUtc);

            return new TimereportFullProjection()
            {
                Id = ObjectId.GenerateNewId(),
                AggregateId = aggregate.Id,
                AggregateVersion = aggregate.Version,
                Active = aggregate.Active,
                Days = aggregate.Days,
                Enabled = aggregate.Enabled,
                IsAssignedToBooking = events.Select(x => x.Payload).OfType<TimereportAssignedToBookingPayload>().Any(),
                CustomerAllowsDigitalReport = aggregate.CustomerAllowsDigitalReport,
                Status = aggregate.Status,
                LastStatusChangeUtc = aggregate.LastStatusChangeUtc,
                SentToCustomerTrack = aggregate.SentToCustomerTrack,
                ConsultantId = aggregate.ConsultantId,
                BookingId = aggregate.BookingId,
                Workplace = aggregate.Workplace,
                WorkplaceId = aggregate.WorkplaceId,
                Department = aggregate.Department,
                DepartmentId = aggregate.DepartmentId,
                StartsOnUtc = aggregate.StartsOnUtc,
                Week = weekYear.Week,
                Year = weekYear.Year,
                TotalExpenses = aggregate.TotalExpenses,
                TotalMileage = aggregate.TotalMileage,
                TotalActiveMinutes = aggregate.TotalActiveMinutes,

                CreatedOnUtc = aggregate.CreatedOnUtc
            };
        }
    }
}